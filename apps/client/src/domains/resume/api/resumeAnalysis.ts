import { mapToCamelCase } from "@/utils/convertConvention";
import {
  InterviewMode,
  ResumeAnalysis,
  ResumeAnalysisInterviewStartRequest,
  ResumeAnalysisInterviewStartResponse,
  ResumeAnalysisInterviewStartResult,
  ResumeAnalysisList,
  ResumeAnalysisListResponse,
  ResumeAnalysisResponse,
  ResumeAnalysisState,
  ResumeAnalysisSubmitResponse,
  ResumeAnalysisSubmitResult
} from "@kokomen/types";
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse
} from "axios";
import { delay, exponentialDelay } from "@kokomen/utils";
import { GetServerSidePropsContext } from "next";

// 요청별 재시도 상태를 관리하는 Map
const retryStateMap: Map<string, number> = new Map<string, number>();

// 요청 식별자 생성 함수
const createRequestId = (config: AxiosRequestConfig): string => {
  const { method, url, params } = config;
  return `${method}:${url}:${JSON.stringify(params || {})}`;
};

const getRetryCount = (requestId: string): number => {
  return retryStateMap.get(requestId) || 0;
};

const incrementRetryCount = (requestId: string): number => {
  const newCount = getRetryCount(requestId) + 1;
  retryStateMap.set(requestId, newCount);
  return newCount;
};

const resetRetryCount = (requestId: string): void => {
  retryStateMap.delete(requestId);
};

const RESUME_ANALYSES_BASE_URL: string = `${process.env.NEXT_PUBLIC_API_BASE_URL}/resume-analyses`;

/**
 * CamelCasedProperties는 optional 중첩 객체와 string[]을 그대로 표현하지 못하므로
 * 직접 선언한 camelCase 타입으로 단언한다. 런타임 변환은 mapToCamelCase가 담당한다.
 */
function toCamelCased<T>(data: object): T {
  return mapToCamelCase(data) as unknown as T;
}

// ===== 분석 제출 =====
const resumeAnalysisSubmitInstance: AxiosInstance = axios.create({
  baseURL: RESUME_ANALYSES_BASE_URL,
  withCredentials: true
});

resumeAnalysisSubmitInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    resetRetryCount(createRequestId(response.config));
    return response;
  },
  async (error: AxiosError) => {
    const requestId = createRequestId(error.config as AxiosRequestConfig);
    const status = error.response?.status;
    // 4xx는 재시도해도 결과가 같고, PDF를 다시 업로드하게 되므로 즉시 반환
    const isRetryable = status === undefined || status >= 500;
    if (!isRetryable) {
      resetRetryCount(requestId);
      return Promise.reject(error);
    }

    const retryCount = incrementRetryCount(requestId);
    const maxRetries = 3;
    if (retryCount >= maxRetries) {
      resetRetryCount(requestId);
      return Promise.reject(error);
    }

    await exponentialDelay(retryCount);
    return resumeAnalysisSubmitInstance.request(
      error.config as AxiosRequestConfig
    );
  }
);

/**
 * 이력서 분석 제출.
 * resume(파일) 또는 resume_id(저장된 이력서) 중 하나가 필요하며,
 * 202와 함께 analysis_id를 반환한다. 비회원은 guest_token도 함께 받는다.
 */
function submitResumeAnalysis(
  data: FormData
): Promise<ResumeAnalysisSubmitResult> {
  return resumeAnalysisSubmitInstance
    .post<ResumeAnalysisSubmitResponse>("", data)
    .then((res) => toCamelCased<ResumeAnalysisSubmitResult>(res.data));
}

// ===== 분석 상태 폴링 =====
const resumeAnalysisPollingInstance: AxiosInstance = axios.create({
  baseURL: RESUME_ANALYSES_BASE_URL,
  withCredentials: true
});

// 평가 -> 질문 생성 두 단계를 모두 기다려야 하므로 기존 평가 폴링보다 여유를 둔다 (약 3분)
const POLLING_INTERVAL_MS: number = 2000;
const MAX_POLLING_COUNT: number = 90;

// 폴링 횟수와 통신 오류 재시도 횟수는 따로 세야 한다.
// 같이 세면 폴링이 길어질수록 일시적인 오류 한 번에 바로 중단된다.
const pollingErrorRequestId = (requestId: string): string =>
  `pollingError:${requestId}`;

const finishPolling = (requestId: string): void => {
  resetRetryCount(requestId);
  resetRetryCount(pollingErrorRequestId(requestId));
};

const onFulfilledPolling = async (
  response: AxiosResponse<ResumeAnalysisResponse>
): Promise<AxiosResponse<ResumeAnalysisResponse>> => {
  const requestId = createRequestId(response.config);
  const { state } = response.data;

  if (state === "COMPLETED") {
    finishPolling(requestId);
    return response;
  }

  if (state === "EVALUATION_FAILED") {
    finishPolling(requestId);
    return Promise.reject(new Error("이력서 평가 중 오류가 발생했어요"));
  }

  if (state === "QUESTION_FAILED") {
    finishPolling(requestId);
    return Promise.reject(new Error("면접 질문 생성 중 오류가 발생했어요"));
  }

  // PENDING(평가 대기) / EVALUATION_COMPLETED(질문 생성 대기)는 계속 폴링
  const pollCount = incrementRetryCount(requestId);
  if (pollCount >= MAX_POLLING_COUNT) {
    finishPolling(requestId);
    return Promise.reject(new Error("서버가 응답하지 않습니다."));
  }
  // 응답이 정상이었으므로 통신 오류 카운트는 초기화
  resetRetryCount(pollingErrorRequestId(requestId));

  await delay(POLLING_INTERVAL_MS);
  return resumeAnalysisPollingInstance.request(response.config);
};

const onRejectedPolling = async (error: AxiosError): Promise<AxiosResponse> => {
  const requestId = createRequestId(error.config as AxiosRequestConfig);
  const errorRequestId = pollingErrorRequestId(requestId);
  const retryCount = incrementRetryCount(errorRequestId);
  const maxRetries = 3;

  if (retryCount >= maxRetries) {
    finishPolling(requestId);
    return Promise.reject(error);
  }

  await exponentialDelay(retryCount);
  return resumeAnalysisPollingInstance.request(
    error.config as AxiosRequestConfig
  );
};

resumeAnalysisPollingInstance.interceptors.response.use(
  onFulfilledPolling,
  onRejectedPolling
);

/**
 * COMPLETED가 될 때까지 분석 상태를 폴링한다.
 * 평가/질문 생성이 실패하면 사용자에게 보여줄 메시지를 담은 Error로 reject된다.
 */
function pollResumeAnalysisState(
  analysisId: number,
  guestToken?: string
): Promise<ResumeAnalysis> {
  return resumeAnalysisPollingInstance
    .get<ResumeAnalysisResponse>(`/${analysisId}`, {
      params: guestToken ? { guest_token: guestToken } : undefined
    })
    .then((res) => toCamelCased<ResumeAnalysis>(res.data));
}

// ===== 분석 결과 조회 =====
const resumeAnalysisResultInstance: AxiosInstance = axios.create({
  baseURL: RESUME_ANALYSES_BASE_URL,
  withCredentials: true
});

/** 이력서 분석 단건 조회 (SSR에서는 context의 쿠키를 전달) */
function getResumeAnalysis(
  analysisId: number | string,
  context?: GetServerSidePropsContext,
  guestToken?: string
): Promise<ResumeAnalysis> {
  return resumeAnalysisResultInstance
    .get<ResumeAnalysisResponse>(`/${analysisId}`, {
      params: guestToken ? { guest_token: guestToken } : undefined,
      headers: context ? { Cookie: context.req.headers.cookie } : undefined
    })
    .then((res) => toCamelCased<ResumeAnalysis>(res.data));
}

/**
 * 내 이력서 분석 목록 조회 (마이페이지 히스토리)
 * state를 넘기면 해당 상태만 필터한다. 정렬 기본값은 createdAt,DESC.
 */
function getResumeAnalyses(
  page: number = 0,
  size: number = 20,
  options?: {
    state?: ResumeAnalysisState;
    context?: GetServerSidePropsContext;
  }
): Promise<ResumeAnalysisList> {
  return resumeAnalysisResultInstance
    .get<ResumeAnalysisListResponse>("", {
      params: {
        page,
        size,
        ...(options?.state ? { state: options.state } : {})
      },
      headers: options?.context
        ? { Cookie: options.context.req.headers.cookie }
        : undefined
    })
    .then((res) => toCamelCased<ResumeAnalysisList>(res.data));
}

// ===== 분석 기반 면접 시작 =====
const resumeAnalysisInterviewInstance: AxiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}/interviews/resume-analyses`,
  withCredentials: true
});

// 서버가 허용하는 질문 개수 범위
const MIN_QUESTION_COUNT: number = 3;
const MAX_QUESTION_COUNT: number = 20;

/** 서버가 허용하는 범위(3~20)로 질문 개수를 맞춘다 */
function clampQuestionCount(count: number): number {
  return Math.min(MAX_QUESTION_COUNT, Math.max(MIN_QUESTION_COUNT, count));
}

/**
 * 이력서 분석에서 생성된 질문으로 면접을 시작한다.
 * 회원 + COMPLETED(interview_available)일 때만 가능하다.
 */
function createResumeAnalysisInterview({
  analysisId,
  generatedQuestionId,
  maxQuestionCount,
  mode
}: {
  analysisId: number;
  generatedQuestionId: number;
  maxQuestionCount: number;
  mode: InterviewMode;
}): Promise<ResumeAnalysisInterviewStartResult> {
  const body: ResumeAnalysisInterviewStartRequest = {
    generated_question_id: generatedQuestionId,
    max_question_count: clampQuestionCount(maxQuestionCount),
    mode
  };
  return resumeAnalysisInterviewInstance
    .post<ResumeAnalysisInterviewStartResponse>(`/${analysisId}`, body)
    .then((res) => toCamelCased<ResumeAnalysisInterviewStartResult>(res.data));
}

export {
  submitResumeAnalysis,
  pollResumeAnalysisState,
  getResumeAnalysis,
  getResumeAnalyses,
  createResumeAnalysisInterview
};
