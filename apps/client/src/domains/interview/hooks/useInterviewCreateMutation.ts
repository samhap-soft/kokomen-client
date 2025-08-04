import { useRouter } from "next/router";
import { useToast } from "@kokomen/ui/hooks";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { startNewInterview } from "../api";
import { captureFormSubmitEvent } from "@/utils/analytics";

const useInterviewCreateMutation = () => {
  const router = useRouter();
  const { error: errorToast } = useToast();

  return useMutation({
    mutationFn: startNewInterview,
    onMutate: (data) => {
      captureFormSubmitEvent({
        name: "startNewInterview",
        properties: {
          category: data.category,
          questionCount: data.max_question_count
        }
      });
    },
    onSuccess: (data) => {
      router.push({
        pathname: `/interviews/${data.interview_id}`
      });
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        if (error.response?.status === 401) {
          router.replace("/login");
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
};

export default useInterviewCreateMutation;
