import {
  askRequirementQuestion,
  completeRequirements,
  getSystemDesignInterview,
  pollSystemDesignAnswer,
  submitSystemDesignAnswer,
  SystemDesignAnswerError
} from "@/domains/systemDesign/api";
import { systemDesignKeys } from "@/utils/querykeys";
import { SystemDesignDiagram, SystemDesignInterview } from "@kokomen/types";
import { useToast } from "@kokomen/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useCallback } from "react";

const NETWORK_ERROR_DESCRIPTION: string = "네트워크 상태를 확인한 뒤 다시 시도해주세요.";

/** 서버 오류 문구({ message })는 명세대로 그대로 보여 준다 */
const getErrorDescription = (error: unknown): string => {
  if (isAxiosError<{ message?: string }>(error) && error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error instanceof SystemDesignAnswerError) return error.message;
  return NETWORK_ERROR_DESCRIPTION;
};

/**
 * 시스템 설계 면접 조회와 진행(역질문 → 요구사항 완료 → 답변 제출).
 * 서버 응답으로 캐시를 직접 고쳐서, 단계가 바뀔 때마다 다시 조회하지 않는다.
 */
export function useSystemDesignInterview(interviewId: number) {
  const queryClient = useQueryClient();
  const queryKey = systemDesignKeys.byInterviewId(interviewId);
  const { error: errorToast } = useToast();

  const query = useQuery({
    queryKey,
    queryFn: () => getSystemDesignInterview(interviewId)
  });
  const isLastQuestion = (questionId: number): boolean =>
    questionId >= (query.data?.max_question_count ?? Number.POSITIVE_INFINITY);

  const update = useCallback(
    (
      // eslint-disable-next-line no-unused-vars
      updater: (prev: SystemDesignInterview) => SystemDesignInterview
    ): void => {
      queryClient.setQueryData<SystemDesignInterview>(queryKey, (prev) =>
        prev ? updater(prev) : prev
      );
    },
    [queryClient, queryKey]
  );

  const notifyError = useCallback(
    (title: string, error: unknown) =>
      errorToast({
        title,
        description: getErrorDescription(error),
        duration: 5000,
        position: "top-center"
      }),
    [errorToast]
  );

  /** 서버 상태와 화면이 어긋났을 수 있을 때 다시 조회한다(다음 질문으로 넘어갔거나 면접이 끝났을 수 있다) */
  const refetch = useCallback(
    () => queryClient.invalidateQueries({ queryKey }),
    [queryClient, queryKey]
  );

  const askMutation = useMutation({
    mutationFn: (question: string) =>
      askRequirementQuestion({ interviewId, question }),
    onSuccess: (data) => {
      update((prev) => ({
        ...prev,
        requirement_questions: [
          ...prev.requirement_questions,
          { question: data.question, answer: data.answer }
        ]
      }));
    },
    onError: (error) => notifyError("질문을 보내지 못했어요", error)
  });

  const completeMutation = useMutation({
    mutationFn: () => completeRequirements(interviewId),
    onSuccess: (data) => {
      update((prev) => ({
        ...prev,
        stage: data.stage,
        cur_question_id: data.cur_question_id,
        cur_question: data.cur_question
      }));
    },
    onError: (error) => notifyError("다음 단계로 넘어가지 못했어요", error)
  });

  const submitMutation = useMutation({
    mutationFn: (variables: {
      questionId: number;
      question: string;
      answer: string;
      diagram: SystemDesignDiagram;
    }) =>
      submitSystemDesignAnswer({
        interviewId,
        questionId: variables.questionId,
        isLastQuestion: isLastQuestion(variables.questionId),
        answer: variables.answer,
        diagram: variables.diagram
      }),
    onSuccess: (data, variables) => {
      update((prev) => {
        const answeredStage =
          prev.stage === "REQUIREMENTS" ? "HIGH_LEVEL" : prev.stage;
        return {
          ...prev,
          interview_state: data.interview_state,
          stage: data.stage,
          cur_question_id: data.next_question_id,
          cur_question: data.next_question,
          cur_question_count: prev.cur_question_count + 1,
          diagram: variables.diagram,
          prev_questions_and_answers: [
            ...prev.prev_questions_and_answers,
            {
              question_id: variables.questionId,
              stage: answeredStage,
              question: variables.question,
              answer: variables.answer,
              diagram: variables.diagram
            }
          ]
        };
      });
    },
    onError: (error) => {
      notifyError("답변을 제출하지 못했어요", error);
      // 채점 실패(LLM_FAILED)는 같은 질문에 다시 내면 되므로 화면을 그대로 둔다.
      // 그 밖의 경우(시간 초과, 409 등)는 서버에서 이미 다음 질문으로 넘어갔을 수 있어 다시 조회한다
      if (!(error instanceof SystemDesignAnswerError && error.kind === "FAILED")) {
        refetch();
      }
    }
  });

  /**
   * 채점 중에 새로고침하면 면접 조회가 cur_answer_proceed_state = LLM_PENDING 을 준다.
   * 그때는 같은 질문의 결과를 이어서 기다리고, 끝나면 저장된 답변을 다시 조회한다.
   */
  const resumeMutation = useMutation({
    mutationFn: (questionId: number) =>
      pollSystemDesignAnswer({
        interviewId,
        questionId,
        isLastQuestion: isLastQuestion(questionId)
      }),
    onSettled: () => refetch(),
    onError: (error) => notifyError("채점 결과를 받지 못했어요", error)
  });

  return { query, askMutation, completeMutation, submitMutation, resumeMutation };
}
