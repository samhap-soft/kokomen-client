import { useToast } from "@kokomen/ui";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { startNewInterview } from "../api";
import { captureFormSubmitEvent } from "@/utils/analytics";
import { createCustomInterview } from "@/domains/interview/api/questions";
import { startSystemDesignInterview } from "@/domains/systemDesign/api";
import useExtendedRouter from "@/hooks/useExtendedRouter";
import {
  InterviewMode,
  RootQuestionType
} from "@kokomen/types";

type CreateCustomInterviewVariables = {
  rootQuestionId: number;
  maxQuestionCount: number;
  mode: InterviewMode;
  questionType?: RootQuestionType;
  /** 면접실 헤더에 분야 이름을 보여주려고 쿼리로 넘긴다 */
  category: string;
};

const buildRoomSearch = (params: Record<string, string>): string =>
  new URLSearchParams(params).toString();

const useInterviewCreateMutation = ({
  onMutate
}: {
  onMutate?: () => void;
}) => {
  const router = useExtendedRouter();
  const { error: errorToast } = useToast();

  const createRandomInterviewMutation = useMutation({
    mutationFn: startNewInterview,
    onMutate: (data) => {
      captureFormSubmitEvent({
        name: "startNewInterview",
        properties: {
          category: data.category,
          questionCount: data.max_question_count,
          mode: data.mode
        }
      });
    },
    onSuccess: (data, variables) => {
      router.push({
        pathname: `/interviews/${data.interview_id}`,
        search: buildRoomSearch({
          mode: variables.mode,
          category: variables.category
        })
      });
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        if (error.response?.status === 401) {
          router.navigateToLogin();
          return;
        }
        errorToast({
          title: "면접 생성 실패",
          description: error.response?.data.message
        });
      }
    },
    retry: (failureCount, error) => {
      if (isAxiosError(error)) {
        if (
          error.response?.status &&
          error.response.status >= 400 &&
          error.response.status < 500
        ) {
          return false;
        }
        return failureCount < 2;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
  const createCustomInterviewMutation = useMutation({
    mutationFn: ({
      // eslint-disable-next-line no-unused-vars
      questionType: _questionType,
      // eslint-disable-next-line no-unused-vars
      category: _category,
      ...payload
    }: CreateCustomInterviewVariables) => createCustomInterview(payload),
    onMutate: (data) => {
      onMutate?.();
      captureFormSubmitEvent({
        name: "startNewInterview",
        properties: {
          rootQuestionId: data.rootQuestionId,
          maxQuestionCount: data.maxQuestionCount,
          mode: data.mode,
          questionType: data.questionType ?? "GENERAL"
        }
      });
    },
    onSuccess: (data, variables) => {
      router.push({
        pathname: `/interviews/${data.interview_id}`,
        search: buildRoomSearch({
          mode: variables.mode,
          ...(variables.questionType === "CODE" ? { type: "CODE" } : {}),
          category: variables.category
        })
      });
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        if (error.response?.status === 401) {
          router.navigateToLogin();
          return;
        }
      }
    },
    retry: (failureCount, error) => {
      if (isAxiosError(error)) {
        if (
          error.response?.status &&
          error.response.status >= 400 &&
          error.response.status < 500
        ) {
          return false;
        }
        return failureCount < 2;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
  const createSystemDesignInterviewMutation = useMutation({
    mutationFn: () => startSystemDesignInterview(),
    onMutate: () => {
      captureFormSubmitEvent({
        name: "startNewInterview",
        properties: { interviewType: "SYSTEM_DESIGN" }
      });
    },
    onSuccess: (data) => {
      router.push({
        pathname: `/interviews/${data.interview_id}`,
        search: buildRoomSearch({ mode: "TEXT", type: "SYSTEM_DESIGN" })
      });
    },
    onError: (error) => {
      if (isAxiosError(error) && error.response?.status === 401) {
        router.navigateToLogin();
        return;
      }
      errorToast({
        title: "면접 생성 실패",
        description: isAxiosError(error)
          ? error.response?.data?.message
          : "잠시 후 다시 시도해주세요."
      });
    }
  });
  return {
    createRandomInterviewMutation,
    createCustomInterviewMutation,
    createSystemDesignInterviewMutation
  };
};

export default useInterviewCreateMutation;
