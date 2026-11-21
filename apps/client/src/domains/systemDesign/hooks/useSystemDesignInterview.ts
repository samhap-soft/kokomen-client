import {
  askRequirementQuestion,
  completeRequirements,
  getSystemDesignInterview,
  submitSystemDesignAnswer
} from "@/domains/systemDesign/api";
import { systemDesignKeys } from "@/utils/querykeys";
import { SystemDesignDiagram, SystemDesignInterview } from "@kokomen/types";
import { useToast } from "@kokomen/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

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
    (title: string) =>
      errorToast({
        title,
        description: "네트워크 상태를 확인한 뒤 다시 시도해주세요.",
        duration: 5000,
        position: "top-center"
      }),
    [errorToast]
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
    onError: () => notifyError("질문을 보내지 못했어요")
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
    onError: () => notifyError("다음 단계로 넘어가지 못했어요")
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
    onError: () => notifyError("답변을 제출하지 못했어요")
  });

  return { query, askMutation, completeMutation, submitMutation };
}
