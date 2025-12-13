import { mapToCamelCase } from "@/utils/convertConvention";
import { ResumeInput, ResumeOutput, ResumePending } from "@kokomen/types";
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { delay, exponentialDelay } from "@kokomen/utils";

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
const resumeServerInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL + "/resumes",
  withCredentials: true
});
resumeServerInstance.interceptors.response.use(
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
    return resumeServerInstance.request(error.config as AxiosRequestConfig);
  }
);

function submitResumeEvaluation(data: ResumeInput) {
  return resumeServerInstance
    .post<{ evaluation_id: string }>("/evaluations", data)
    .then((res) => res.data)
    .then(mapToCamelCase);
}

const resumePollingServerInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL + "/resumes/evaluations",
  withCredentials: true
});

// 폴링에 대한 요청 완료시
const onFullFilledPolling = async (
  response: AxiosResponse<ResumeOutput | ResumePending>
) => {
  const requestId = createRequestId(response.config);

  if (response.data.state === "COMPLETED") {
    resetRetryCount(requestId);
    return response;
  }

  const retryCount = incrementRetryCount(requestId);
  const maxRetries = 50;

  if (retryCount >= maxRetries) {
    resetRetryCount(requestId);
    return Promise.reject("서버가 응답하지 않습니다.");
  }

  await delay(1000);
  return resumePollingServerInstance.request(response.config);
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
  return resumeServerInstance.request(error.config as AxiosRequestConfig);
};

// 인터뷰 면접 답변 폴링을 위한 서버 인스턴스
resumePollingServerInstance.interceptors.response.use(
  onFullFilledPolling,
  onRejectedPolling
);

function getResumeEvaluationState(evaluationId: string) {
  return resumePollingServerInstance
    .get<ResumeOutput>(`/${evaluationId}/state`)
    .then((res) => res.data)
    .then(mapToCamelCase);
}
export { submitResumeEvaluation, getResumeEvaluationState };
