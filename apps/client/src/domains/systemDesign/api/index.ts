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
 * 시스템 설계 면접 API (초안).
 *
 * 백엔드가 아직 없어서 개발 환경에서는 MSW 목(src/mocks/handlers/systemDesign.ts)이 응답한다.
 * 경로와 필드는 @kokomen/types 의 systemDesign 타입과 함께 백엔드와 맞춘다.
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
const POLLING_MAX_COUNT = 30;

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/** 기존 면접 답변과 같이, 처리가 끝날 때까지 1초마다 최대 30번 조회한다 */
const pollSystemDesignAnswer = async (
  interviewId: number | string,
  questionId: number
): Promise<SystemDesignAnswerResult> => {
  for (let count = 0; count < POLLING_MAX_COUNT; count += 1) {
    const { data } = await systemDesignApiInstance.get<SystemDesignAnswerPolling>(
      `${BASE_PATH}/${interviewId}/questions/${questionId}`
    );
    if (data.proceed_state === "COMPLETED") {
      const { proceed_state: _state, ...result } = data; // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
      return result;
    }
    if (data.proceed_state === "LLM_FAILED") {
      throw new Error("답변에 대한 처리를 하던 중 오류가 발생했습니다.");
    }
    await wait(POLLING_INTERVAL_MS);
  }
  throw new Error("서버가 응답하지 않습니다.");
};

/** 답변을 제출(202)한 뒤 평가가 끝날 때까지 폴링한다 */
export const submitSystemDesignAnswer = async ({
  interviewId,
  questionId,
  ...body
}: SystemDesignAnswerRequest & {
  interviewId: number | string;
  questionId: number;
}): Promise<SystemDesignAnswerResult> => {
  await systemDesignApiInstance.post(
    `${BASE_PATH}/${interviewId}/questions/${questionId}/answers`,
    body
  );
  return pollSystemDesignAnswer(interviewId, questionId);
};

export const getSystemDesignReport = async (
  interviewId: number | string
): Promise<SystemDesignReport> => {
  const { data } = await systemDesignApiInstance.get<SystemDesignReport>(
    `${BASE_PATH}/${interviewId}/report`
  );
  return data;
};
