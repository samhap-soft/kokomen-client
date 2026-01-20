import { mapToCamelCase } from "@/utils/convertConvention";
import {
  ResumeInterviewPending,
  ResumeInterviewFailed,
  ResumeBasedInterviewQuestion,
  ResumeInterviewSuccess,
  Interview,
  InterviewMode,
  ResumeBasedInterviewGenerationsResponse,
  CamelCasedProperties
} from "@kokomen/types";
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { delay, exponentialDelay } from "@kokomen/utils";
import { GetServerSidePropsContext } from "next";

// 요청별 재시도 상태를 관리하는 Map
const retryStateMap = new Map<string, number>();

// 요청 식별자 생성 함수
const createRequestId = (config: AxiosRequestConfig): string => {
  const { method, url, data } = config;
  return `${method}:${url}:${JSON.stringify(data || {})}`;
};

// 재시도 상태 관리 함수들
const getRetryCount = (requestId: string): number => {
  return retryStateMap.get(requestId) || 0;
};

const incrementRetryCount = (requestId: string): number => {
  const currentCount = getRetryCount(requestId);
  const newCount = currentCount + 1;
  retryStateMap.set(requestId, newCount);
  return newCount;
};

const resetRetryCount = (requestId: string): void => {
  retryStateMap.delete(requestId);
};

// 이력서 제출 부분
const resumeBasedInterviewServerInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL + "/interviews/resume-based",
  withCredentials: true
});
resumeBasedInterviewServerInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // 성공 시 해당 요청의 retry 상태 정리
    const requestId = createRequestId(response.config);
    resetRetryCount(requestId);
    return response;
  },

  // 에러 응답 처리
  async (error: AxiosError) => {
    const requestId = createRequestId(error.config as AxiosRequestConfig);
    const retryCount = incrementRetryCount(requestId);
    const maxRetries = 3;

    if (retryCount >= maxRetries) {
      resetRetryCount(requestId);
      return Promise.reject(error);
    }

    await exponentialDelay(retryCount);
    return resumeBasedInterviewServerInstance.request(
      error.config as AxiosRequestConfig
    );
  }
);

function generateResumeBasedInterviewQuestion(data: FormData) {
  return resumeBasedInterviewServerInstance
    .post<{ resume_based_interview_result_id: number }>(
      "/questions/generate",
      data
    )
    .then((res) => res.data)
    .then(mapToCamelCase);
}

const resumeBasedInterviewQuestionPollingServerInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL + "/interviews/resume-based",
  withCredentials: true
});

// 폴링에 대한 요청 완료시
const onFullFilledPolling = async (
  response: AxiosResponse<
    ResumeInterviewSuccess | ResumeInterviewPending | ResumeInterviewFailed
  >
) => {
  const requestId = createRequestId(response.config);
  console.log(response.data);

  if (response.data.state === "COMPLETED") {
    resetRetryCount(requestId);
    return response;
  }

  if (response.data.state === "FAILED")
    return Promise.reject("이력서 평가 중 오류가 발생했어요");

  const retryCount = incrementRetryCount(requestId);
  const maxRetries = 50;

  if (retryCount >= maxRetries) {
    resetRetryCount(requestId);
    return Promise.reject("서버가 응답하지 않습니다.");
  }

  await delay(1000);
  return resumeBasedInterviewQuestionPollingServerInstance.request(
    response.config
  );
};

// 폴링 에러 처리 함수
const onRejectedPolling = async (error: AxiosError) => {
  const requestId = createRequestId(error.config as AxiosRequestConfig);
  const retryCount = incrementRetryCount(requestId);
  const maxRetries = 3;

  if (retryCount >= maxRetries) {
    resetRetryCount(requestId);
    return Promise.reject(error);
  }

  await exponentialDelay(retryCount);
  return resumeBasedInterviewQuestionPollingServerInstance.request(
    error.config as AxiosRequestConfig
  );
};

// 인터뷰 면접 답변 폴링을 위한 서버 인스턴스
resumeBasedInterviewQuestionPollingServerInstance.interceptors.response.use(
  onFullFilledPolling,
  onRejectedPolling
);

function checkResumeBasedInterviewQuestion(
  resumeBasedInterviewQuestionId: number
) {
  return resumeBasedInterviewQuestionPollingServerInstance
    .get(`/${resumeBasedInterviewQuestionId}/check`)
    .then((res) => res.data)
    .then(mapToCamelCase);
}

const resumeBasedInterviewResultServerInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL + "/interviews/resume-based",
  withCredentials: true
});

function getResumeInterviewResult(
  resumeBasedInterviewResultId: number,
  context: GetServerSidePropsContext
) {
  return resumeBasedInterviewResultServerInstance
    .get<ResumeBasedInterviewQuestion[]>(`/${resumeBasedInterviewResultId}`, {
      headers: {
        Cookie: context.req.headers.cookie
      }
    })
    .then((res) => res.data)
    .then(mapToCamelCase);
}

function getResumeBasedInterviewGenerations(
  page: number = 0,
  context?: GetServerSidePropsContext
): Promise<CamelCasedProperties<ResumeBasedInterviewGenerationsResponse>> {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL + "/interviews/resume-based",
    withCredentials: true
  });

  return instance
    .get<CamelCasedProperties<ResumeBasedInterviewGenerationsResponse>>(
      "/questions/generations",
      {
        params: {
          page
        },
        headers: context
          ? {
              Cookie: context.req.headers.cookie
            }
          : undefined
      }
    )
    .then((res) => res.data);
}

const resumeBasedInterviewCreateInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true
});

function createResumeBasedInterview({
  resumeBasedInterviewResultId,
  generatedQuestionId,
  maxQuestionCount,
  mode
}: {
  resumeBasedInterviewResultId: number;
  generatedQuestionId: number;
  maxQuestionCount: number;
  mode: InterviewMode;
}): Promise<Interview> {
  return resumeBasedInterviewCreateInstance
    .post<Interview>(
      `/interviews/resume-based/${resumeBasedInterviewResultId}`,
      {
        generated_question_id: generatedQuestionId,
        max_question_count: maxQuestionCount,
        mode
      }
    )
    .then((res) => res.data);
}

export {
  generateResumeBasedInterviewQuestion,
  checkResumeBasedInterviewQuestion,
  getResumeInterviewResult,
  createResumeBasedInterview,
  getResumeBasedInterviewGenerations
};
