import axios, {
  AxiosError,
  AxiosInstance,
  AxiosPromise,
  AxiosRequestConfig,
  AxiosResponse
} from "axios";
import { delay, exponentialDelay, mapToCamelCase } from "@kokomen/utils";
import {
  CamelCasedProperties,
  InterviewAnswerForm,
  InterviewMode,
  InterviewSubmitPolling,
  InterviewSubmitPollingSuccess
} from "@kokomen/types";

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

// 인터뷰 면접 답변에 대한 서버 인스턴스
const answerServerInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_V2_API_BASE_URL,
  withCredentials: true
});

export async function submitInterviewAnswerV2({
  interviewId,
  questionId,
  answer,
  mode
}: InterviewAnswerForm): AxiosPromise {
  return answerServerInstance.post(
    `/interviews/${interviewId}/questions/${questionId}/answers`,
    { answer, mode },
    { timeout: 10000 }
  );
}

// POST 요청에 대한 인터셉터
answerServerInstance.interceptors.response.use(
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
    return answerServerInstance.request(error.config as AxiosRequestConfig);
  }
);

// 인터뷰 면접 답변 폴링을 위한 서버 인스턴스
const answerV2ServerInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_V2_API_BASE_URL,
  withCredentials: true
});

// API 요청
export async function getInterviewAnswerV2({
  interviewId,
  questionId,
  mode
}: {
  interviewId: number;
  questionId: number;
  mode: InterviewMode;
}): Promise<CamelCasedProperties<InterviewSubmitPollingSuccess>> {
  return answerV2ServerInstance
    .get<InterviewSubmitPollingSuccess>(
      `/interviews/${interviewId}/questions/${questionId}?mode=${mode}`
    )
    .then((res) => res.data)
    .then((data) => mapToCamelCase(data));
}

// 폴링 응답 처리 함수
const onFullFilledPolling = async (
  response: AxiosResponse<InterviewSubmitPolling>
) => {
  const requestId = createRequestId(response.config);

  if (response.data.proceed_state === "COMPLETED") {
    resetRetryCount(requestId);
    return response;
  }

  if (
    response.data.proceed_state === "LLM_FAILED" ||
    response.data.proceed_state === "TTS_FAILED"
  ) {
    resetRetryCount(requestId);
    return Promise.reject("답변에 대한 처리를 하던 중 오류가 발생했습니다.");
  }

  const retryCount = incrementRetryCount(requestId);
  const maxRetries = 20;

  if (retryCount >= maxRetries) {
    resetRetryCount(requestId);
    return Promise.reject("서버가 응답하지 않습니다.");
  }

  await delay(1000);
  return answerV2ServerInstance.request(response.config);
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
  return answerV2ServerInstance.request(error.config as AxiosRequestConfig);
};

// 인터뷰 면접 답변 폴링을 위한 서버 인스턴스
answerV2ServerInstance.interceptors.response.use(
  onFullFilledPolling,
  onRejectedPolling
);
