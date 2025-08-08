import { interviewApiInstance } from "@/domains/interview/api";
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  isAxiosError
} from "axios";
import { exponentialDelay } from "@kokomen/utils";

// 더 구체적인 타입 정의
interface InterviewAnswerApiRequest {
  answer: string;
}

interface InterviewAnswerApiResponse {
  cur_answer_rank: "A" | "B" | "C" | "D" | "F";
  next_question_id: number;
  next_question: string;
}

// API 함수의 매개변수 타입 정의
interface SubmitInterviewAnswerParams {
  interviewId: number;
  questionId: number;
  answer: string;
}

export async function submitInterviewAnswer({
  interviewId,
  questionId,
  answer
}: SubmitInterviewAnswerParams): Promise<
  AxiosResponse<InterviewAnswerApiResponse>
> {
  return interviewApiInstance.post<
    InterviewAnswerApiResponse,
    AxiosResponse<InterviewAnswerApiResponse>,
    InterviewAnswerApiRequest
  >(
    `/interviews/${interviewId}/questions/${questionId}/answers`,
    { answer },
    { timeout: 30000 }
  );
}

const answerServerInstance: AxiosInstance = axios.create({
  withCredentials: true
});

// 커스텀 에러 클래스들
class InterviewAnswerPollingServerError extends Error {
  constructor() {
    super("서버의 응답을 가져오던 중 오류가 발생했습니다.");
  }
}

class InterviewAnswerPollingException extends Error {
  constructor() {
    super("서버의 응답을 가져오던 중 오류가 발생했습니다.");
  }
}

class InterviewAnswerServerException extends Error {
  constructor() {
    super("서버의 응답을 가져오던 중 오류가 발생했습니다.");
  }
}

// 에러 타입 정의
type ErrorType =
  | "pollingException"
  | "serverException"
  | "pollingServerException";

// Retry 설정 타입
interface RetryConfig {
  MAX_RETRY: number;
  STATUS_CODE: number;
  ERROR_CLASS:
    | typeof InterviewAnswerPollingServerError
    | typeof InterviewAnswerPollingException
    | typeof InterviewAnswerServerException;
}

// Retry 설정 객체
const RETRY_CONFIG: Record<string, RetryConfig> = {
  POLLING_SERVER_EXCEPTION: {
    MAX_RETRY: 3,
    STATUS_CODE: 503,
    ERROR_CLASS: InterviewAnswerPollingServerError
  },
  POLLING_EXCEPTION: {
    MAX_RETRY: 5,
    STATUS_CODE: 408,
    ERROR_CLASS: InterviewAnswerPollingException
  },
  SERVER_EXCEPTION: {
    MAX_RETRY: 3,
    STATUS_CODE: 500,
    ERROR_CLASS: InterviewAnswerServerException
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
  errorType: ErrorType,
  ErrorClass: any
): Promise<AxiosResponse> => {
  const requestKey = createRequestKey(config);

  // 현재 retry 상태 가져오기 또는 초기화
  let retryState = retryStateMap.get(requestKey);
  if (!retryState) {
    retryState = { count: 0, errorType };
    retryStateMap.set(requestKey, retryState);
  }

  console.log("retryState", retryStateMap);
  retryState.count++;

  console.log(
    `Retry 시도 ${retryState.count}/${maxRetry} - 상태코드: ${error.response?.status}`
  );

  // 최대 retry 횟수 초과 시 에러 throw
  if (retryState.count >= maxRetry) {
    retryStateMap.delete(requestKey); // 상태 정리
    throw new ErrorClass();
  }

  console.log("지수백오프 go");
  // 지수 백오프 적용하여 재시도
  await exponentialDelay(retryState.count);
  console.log("지수백오프 끝");

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
            "pollingServerException",
            RETRY_CONFIG.POLLING_SERVER_EXCEPTION.ERROR_CLASS
          );

        case RETRY_CONFIG.POLLING_EXCEPTION.STATUS_CODE:
          return await executeRetry(
            error,
            config,
            RETRY_CONFIG.POLLING_EXCEPTION.MAX_RETRY,
            "pollingException",
            RETRY_CONFIG.POLLING_EXCEPTION.ERROR_CLASS
          );

        case RETRY_CONFIG.SERVER_EXCEPTION.STATUS_CODE:
          return await executeRetry(
            error,
            config,
            RETRY_CONFIG.SERVER_EXCEPTION.MAX_RETRY,
            "serverException",
            RETRY_CONFIG.SERVER_EXCEPTION.ERROR_CLASS
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
}): Promise<AxiosResponse<InterviewAnswerApiResponse>> {
  return answerServerInstance.post<InterviewAnswerApiResponse>(
    `/api/interviews/answers?interviewId=${interviewId}&questionId=${questionId}`,
    { answer },
    { timeout: 30000 }
  );
}
