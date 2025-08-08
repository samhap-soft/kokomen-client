import { interviewApiInstance } from "@/domains/interviews/api";
import { exponentialDelay } from "@kokomen/utils";
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosPromise,
  AxiosRequestConfig,
  AxiosResponse
} from "axios";

interface InterviewAnswerResponse {
  cur_answer_rank: string;
  next_question_id: number;
  next_question: string;
}

export async function submitInterviewAnswer({
  interviewId,
  questionId,
  answer
}: {
  interviewId: number;
  questionId: number;
  answer: string;
}): AxiosPromise<InterviewAnswerResponse> {
  return interviewApiInstance.post(
    `/interviews/${interviewId}/questions/${questionId}/answers`,
    {
      answer: answer
    },
    {
      timeout: 30000
    }
  );
}

const answerServerInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_WEB_BASE_URL,
  withCredentials: true
});

// 에러 타입 정의
type ErrorType =
  | "pollingException"
  | "serverException"
  | "pollingServerException";

// Retry 설정 타입
interface RetryConfig {
  MAX_RETRY: number;
  STATUS_CODE: number;
}

// Retry 설정 객체
const RETRY_CONFIG: Record<string, RetryConfig> = {
  POLLING_SERVER_EXCEPTION: {
    MAX_RETRY: 3,
    STATUS_CODE: 503
  },
  POLLING_EXCEPTION: {
    MAX_RETRY: 5,
    STATUS_CODE: 408
  },
  SERVER_EXCEPTION: {
    MAX_RETRY: 3,
    STATUS_CODE: 500
  }
} as const;

// 요청을 식별할 수 있는 고유 키 생성 함수
const createRequestKey = (config: AxiosRequestConfig): string => {
  const { method, url, data } = config;
  return `${method}:${url}:${JSON.stringify(data)}`;
};

// Retry 상태를 관리하기 위한 Map (요청 키를 사용)
const retryStateMap = new Map<
  string,
  { count: number; errorType: ErrorType }
>();

// Retry 처리 함수
const executeRetry = async (
  error: AxiosError,
  config: AxiosRequestConfig,
  maxRetry: number,
  errorType: ErrorType
): Promise<AxiosResponse> => {
  const requestKey = createRequestKey(config);

  // 현재 retry 상태 가져오기 또는 초기화
  let retryState = retryStateMap.get(requestKey);
  if (!retryState) {
    retryState = { count: 0, errorType };
    retryStateMap.set(requestKey, retryState);
  }

  retryState.count++;

  // 최대 retry 횟수 초과 시 에러 throw
  if (retryState.count >= maxRetry) {
    retryStateMap.delete(requestKey); // 상태 정리
    throw new Error("서버에 오류가 발생했습니다.");
  }

  // 지수 백오프 적용하여 재시도
  await exponentialDelay(retryState.count);

  // 재요청 실행
  const response = await answerServerInstance.request(config);
  retryStateMap.delete(requestKey); // 성공 시 상태 정리
  return response;
};

// Response interceptor 설정
answerServerInstance.interceptors.response.use(
  // 성공 응답 처리
  (response: AxiosResponse) => {
    // 성공 시 retry 상태 정리
    if (response.config) {
      const requestKey = createRequestKey(response.config);
      retryStateMap.delete(requestKey);
    }
    return response;
  },

  // 에러 응답 처리
  async (error: AxiosError) => {
    const status = error.response?.status;
    const config = error.config;

    if (!config) {
      return Promise.reject(error);
    }

    console.log(`에러 발생 - 상태코드: ${status}`);

    // 상태코드에 따른 retry 로직
    try {
      switch (status) {
        case RETRY_CONFIG.POLLING_SERVER_EXCEPTION.STATUS_CODE:
          return await executeRetry(
            error,
            config,
            RETRY_CONFIG.POLLING_SERVER_EXCEPTION.MAX_RETRY,
            "pollingServerException"
          );

        case RETRY_CONFIG.POLLING_EXCEPTION.STATUS_CODE:
          return await executeRetry(
            error,
            config,
            RETRY_CONFIG.POLLING_EXCEPTION.MAX_RETRY,
            "pollingException"
          );

        case RETRY_CONFIG.SERVER_EXCEPTION.STATUS_CODE:
          return await executeRetry(
            error,
            config,
            RETRY_CONFIG.SERVER_EXCEPTION.MAX_RETRY,
            "serverException"
          );

        default:
          // retry 대상이 아닌 에러는 그대로 reject
          return Promise.reject(error);
      }
    } catch (retryError) {
      // retry 실패 시 에러 reject
      return Promise.reject(retryError);
    }
  }
);

// API 호출 함수
export async function submitInterviewAnswerV2({
  interviewId,
  questionId,
  answer
}: {
  interviewId: number;
  questionId: number;
  answer: string;
}): Promise<AxiosResponse<InterviewAnswerResponse>> {
  return answerServerInstance.post<InterviewAnswerResponse>(
    `/api/interviews/answers?interviewId=${interviewId}&questionId=${questionId}`,
    { answer },
    { timeout: 30000 }
  );
}
