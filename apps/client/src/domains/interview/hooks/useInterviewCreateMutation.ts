import { useToast } from "@kokomen/ui";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { startNewInterview } from "../api";
import { captureFormSubmitEvent } from "@/utils/analytics";
import { createCustomInterview } from "@/domains/interview/api/questions";
import useExtendedRouter from "@/hooks/useExtendedRouter";

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
        search: `mode=${variables.mode}`
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
    mutationFn: createCustomInterview,
    onMutate: (data) => {
      onMutate?.();
      captureFormSubmitEvent({
        name: "startNewInterview",
        properties: {
          rootQuestionId: data.rootQuestionId,
          maxQuestionCount: data.maxQuestionCount,
          mode: data.mode
        }
      });
    },
    onSuccess: (data, variables) => {
      router.push({
        pathname: `/interviews/${data.interview_id}`,
        search: `mode=${variables.mode}`
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
  return {
    createRandomInterviewMutation,
    createCustomInterviewMutation
  };
};

export default useInterviewCreateMutation;
