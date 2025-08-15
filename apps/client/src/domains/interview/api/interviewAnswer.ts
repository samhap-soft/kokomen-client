import axios, {
  AxiosError,
  AxiosInstance,
  AxiosPromise,
  AxiosRequestConfig,
  AxiosResponse
} from "axios";
import { delay, exponentialDelay } from "@kokomen/utils";
import {
  InterviewAnswerForm,
  InterviewMode,
  InterviewSubmitPolling,
  InterviewSubmitPollingSuccess
} from "@kokomen/types";

// Retry 설정 타입
interface RetryConfig {
  max: number;
  retry: number;
}

// Retry 설정 객체
const RETRY_CONFIG: Record<string, RetryConfig> = {
  POLLING: {
    max: 20,
    retry: 0
  },
  POLLING_REJECTED: {
    max: 3,
    retry: 0
  },
  ANSWER_SUBMIT: {
    max: 3,
    retry: 0
  }
} as const;

// 인터뷰 면접 답변에 대한 서버 인스턴스
const answerServerInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_V2_API_BASE_URL,
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
    { timeout: 2000 }
  );
}

// POST 요청에 대한 인터셉터
answerServerInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // 성공 시 retry 상태 정리
    RETRY_CONFIG.ANSWER_SUBMIT.retry = 0;
    return response;
  },

  // 에러 응답 처리
  async (error: AxiosError) => {
    if (RETRY_CONFIG.ANSWER_SUBMIT.retry >= RETRY_CONFIG.ANSWER_SUBMIT.max) {
      RETRY_CONFIG.ANSWER_SUBMIT.retry = 0;
      return Promise.reject(error);
    }
    RETRY_CONFIG.ANSWER_SUBMIT.retry++;
    await exponentialDelay(RETRY_CONFIG.ANSWER_SUBMIT.retry);
    return answerServerInstance.request(error.config as AxiosRequestConfig);
  }
);

// 인터뷰 면접 답변 폴링을 위한 서버 인스턴스
const answerV2ServerInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_V2_API_BASE_URL,
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
}): AxiosPromise<InterviewSubmitPollingSuccess> {
  return answerV2ServerInstance.get(
    `/interviews/${interviewId}/questions/${questionId}?mode=${mode}`
  );
}

// 폴링 중에는 서버 오류가 아닌 이상 200번대 응답이 오기 때문에 200처리에서도 오류 분기처리
const onFullFilledPolling = async (
  response: AxiosResponse<InterviewSubmitPolling>
) => {
  if (response.data.proceed_state === "COMPLETED") {
    RETRY_CONFIG.POLLING.retry = 0;
    return response;
  }

  if (
    response.data.proceed_state === "LLM_FAILED" ||
    response.data.proceed_state === "TTS_FAILED"
  ) {
    RETRY_CONFIG.POLLING.retry = 0;
    return Promise.reject("답변에 대한 처리를 하던 중 오류가 발생했습니다.");
  }

  if (RETRY_CONFIG.POLLING.retry >= RETRY_CONFIG.POLLING.max) {
    RETRY_CONFIG.POLLING.retry = 0;
    return Promise.reject("서버가 응답하지 않습니다.");
  }

  RETRY_CONFIG.POLLING.retry++;

  await delay(1000);
  return answerV2ServerInstance.request(response.config);
};

const onRejectedPolling = async (error: AxiosError) => {
  if (
    RETRY_CONFIG.POLLING_REJECTED.retry >= RETRY_CONFIG.POLLING_REJECTED.max
  ) {
    RETRY_CONFIG.POLLING_REJECTED.retry = 0;
    return Promise.reject(error);
  }
  RETRY_CONFIG.POLLING_REJECTED.retry++;
  await exponentialDelay(RETRY_CONFIG.POLLING_REJECTED.retry);
  return answerV2ServerInstance.request(error.config as AxiosRequestConfig);
};

// 인터뷰 면접 답변 폴링을 위한 서버 인스턴스
answerV2ServerInstance.interceptors.response.use(
  onFullFilledPolling,
  onRejectedPolling
);
