import { enableMocking, isApiMockingEnabled } from "@/mocks/enableMocking";
import axios, { AxiosInstance } from "axios";
import {
  CompleteRequirementsResponse,
  RequirementQuestionResponse,
  SystemDesignAnswerRequest,
  SystemDesignAnswerResponse,
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

export const submitSystemDesignAnswer = async ({
  interviewId,
  ...body
}: SystemDesignAnswerRequest & {
  interviewId: number | string;
}): Promise<SystemDesignAnswerResponse> => {
  const { data } = await systemDesignApiInstance.post<SystemDesignAnswerResponse>(
    `${BASE_PATH}/${interviewId}/answers`,
    body
  );
  return data;
};

export const getSystemDesignReport = async (
  interviewId: number | string
): Promise<SystemDesignReport> => {
  const { data } = await systemDesignApiInstance.get<SystemDesignReport>(
    `${BASE_PATH}/${interviewId}/report`
  );
  return data;
};
