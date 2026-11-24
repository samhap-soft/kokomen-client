import { enableMocking, isApiMockingEnabled } from "@/mocks/enableMocking";
import axios, { AxiosInstance } from "axios";
import {
  CompleteRequirementsResponse,
  RequirementQuestionResponse,
  SystemDesignAnswerPolling,
  SystemDesignAnswerRequest,
  SystemDesignAnswerResult,
  SystemDesignInterview,
  StartSystemDesignInterviewResponse,
  SystemDesignReport
} from "@kokomen/types";

/**
 * 시스템 설계 면접 API. 명세: https://api-dev.kokomen.kr/docs/index.html 5장.
 * 오류 본문은 { message } 이고, 문구를 그대로 사용자에게 보여 준다.
 *
 * yarn dev:mock 에서는 MSW 목(src/mocks/handlers/systemDesign.ts)이 대신 응답한다.
 */
const BASE_PATH = "/interviews/system-design";

const systemDesignApiInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true
});

if (isApiMockingEnabled()) {
  systemDesignApiInstance.interceptors.request.use(async (config) => {
    await enableMocking();
    return config;
  });
}

/** 본문 없이 보낸다. 서버가 난이도를 BASIC 으로 정한다 */
export const startSystemDesignInterview =
  async (): Promise<StartSystemDesignInterviewResponse> => {
    const { data } =
      await systemDesignApiInstance.post<StartSystemDesignInterviewResponse>(
        BASE_PATH
      );
    return data;
  };

export const getSystemDesignInterview = async (
  interviewId: number | string
): Promise<SystemDesignInterview> => {
  const { data } = await systemDesignApiInstance.get<SystemDesignInterview>(
    `${BASE_PATH}/${interviewId}`
  );
  return data;
};

export const askRequirementQuestion = async ({
  interviewId,
  question
}: {
  interviewId: number | string;
  question: string;
}): Promise<RequirementQuestionResponse> => {
  const { data } = await systemDesignApiInstance.post<RequirementQuestionResponse>(
    `${BASE_PATH}/${interviewId}/requirement-questions`,
    { question }
  );
  return data;
};

export const completeRequirements = async (
  interviewId: number | string
): Promise<CompleteRequirementsResponse> => {
  const { data } =
    await systemDesignApiInstance.post<CompleteRequirementsResponse>(
      `${BASE_PATH}/${interviewId}/requirements/complete`
    );
  return data;
};

const POLLING_INTERVAL_MS = 1000;
/** 1~5번째 답변은 30초, 리포트까지 만드는 마지막 답변은 90초 안에 끝나는 것이 서버 기준이다 */
const POLLING_MAX_COUNT = 30;
const LAST_ANSWER_POLLING_MAX_COUNT = 90;

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/** 채점 결과를 기다리다 실패했을 때. 화면은 kind 를 보고 안내와 다음 동작을 고른다 */
export class SystemDesignAnswerError extends Error {
  readonly kind: "FAILED" | "TIMEOUT";

  constructor(kind: "FAILED" | "TIMEOUT") {
    super(
      kind === "FAILED"
        ? "채점에 실패했어요. 같은 답변을 다시 제출해 주세요."
        : "채점이 오래 걸리고 있어요. 잠시 후 면접 상태를 다시 확인해 주세요."
    );
    this.name = "SystemDesignAnswerError";
    this.kind = kind;
  }
}

/**
 * 답변 결과를 1초마다 조회한다. 마지막 질문이면 최대 90번, 아니면 30번이다.
 * 채점 중에 새로고침한 경우에도 이 함수로 이어서 기다린다.
 */
export const pollSystemDesignAnswer = async ({
  interviewId,
  questionId,
  isLastQuestion
}: {
  interviewId: number | string;
  questionId: number;
  isLastQuestion: boolean;
}): Promise<SystemDesignAnswerResult> => {
  const maxCount = isLastQuestion ? LAST_ANSWER_POLLING_MAX_COUNT : POLLING_MAX_COUNT;
  for (let count = 0; count < maxCount; count += 1) {
    const { data } = await systemDesignApiInstance.get<SystemDesignAnswerPolling>(
      `${BASE_PATH}/${interviewId}/questions/${questionId}`
    );
    if (data.proceed_state === "COMPLETED") {
      const { proceed_state: _state, ...result } = data; // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
      return result;
    }
    if (data.proceed_state === "LLM_FAILED") {
      throw new SystemDesignAnswerError("FAILED");
    }
    await wait(POLLING_INTERVAL_MS);
  }
  throw new SystemDesignAnswerError("TIMEOUT");
};

/** 답변을 제출(202)한 뒤 채점이 끝날 때까지 폴링한다 */
export const submitSystemDesignAnswer = async ({
  interviewId,
  questionId,
  isLastQuestion,
  ...body
}: SystemDesignAnswerRequest & {
  interviewId: number | string;
  questionId: number;
  isLastQuestion: boolean;
}): Promise<SystemDesignAnswerResult> => {
  await systemDesignApiInstance.post(
    `${BASE_PATH}/${interviewId}/questions/${questionId}/answers`,
    body
  );
  return pollSystemDesignAnswer({ interviewId, questionId, isLastQuestion });
};

export const getSystemDesignReport = async (
  interviewId: number | string
): Promise<SystemDesignReport> => {
  const { data } = await systemDesignApiInstance.get<SystemDesignReport>(
    `${BASE_PATH}/${interviewId}/report`
  );
  return data;
};
