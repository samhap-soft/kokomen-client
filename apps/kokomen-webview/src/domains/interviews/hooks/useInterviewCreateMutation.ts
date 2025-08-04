import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { startNewInterview } from "../api";
import { useNavigate } from "@tanstack/react-router";
import { useToast } from "@kokomen/ui";

const useInterviewCreateMutation = () => {
  const navigate = useNavigate();
  // const { addToast, removeToast, toasts } = useToastContext();
  const { error: errorToast } = useToast();

  return useMutation({
    mutationFn: startNewInterview,
    // onMutate: (data) => {
    //   captureFormSubmitEvent({
    //     name: "startNewInterview",
    //     properties: {
    //       category: data.category,
    //       questionCount: data.max_question_count,
    //     },
    //   });
    // },
    onSuccess: (data) => {
      navigate({
        to: `/interviews/${data.interview_id}`
      });
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        if (error.response?.status === 401) {
          navigate({
            to: "/login",
            search: { redirectTo: `/interviews/` }
          });
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
