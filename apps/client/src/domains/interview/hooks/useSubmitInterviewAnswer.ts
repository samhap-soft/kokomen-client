import {
  getInterviewAnswerV2,
  submitInterviewAnswerV2
} from "@/domains/interview/api/interviewAnswer";
import { publishInterviewEvent } from "@/domains/interview/utils/interviewEventEmitter";
import { captureFormSubmitEvent } from "@/utils/analytics";
import {
  Interview,
  InterviewAnswerForm as InterviewAnswerFormType
} from "@kokomen/types";
import { useToast } from "@kokomen/ui";
import { getEmotion } from "@kokomen/utils";
import { useMutation } from "@tanstack/react-query";
import React, { useEffect, useRef } from "react";
import type { InterviewerEmotion } from "@/pages/interviews/[interviewId]";

const FINISHED_MESSAGE = "면접이 종료되었습니다. 수고하셨습니다.";
// 분석이 길어질 때 안내를 띄우기까지의 대기 시간(ms)
const ANALYZING_HINT_DELAY_MS = 1500;

type UseSubmitInterviewAnswerOptions = {
  cur_question: string;
  cur_question_id: number;
  prev_questions_and_answers: Interview["prev_questions_and_answers"];
  // eslint-disable-next-line no-unused-vars
  updateInterviewData: (updates: Partial<Interview>) => void;
  setInterviewerEmotion: React.Dispatch<
    React.SetStateAction<InterviewerEmotion>
  >;
  // eslint-disable-next-line no-unused-vars
  playAudio: (audioUrl?: string) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  onAnswerSubmitted?: (submittedAnswer: string) => void;
  /**
   * 제출이 실패했을 때 호출된다. 실패한 답변을 그대로 넘겨주므로
   * 호출부에서 재시도 UI를 띄울 수 있다.
   */
  // eslint-disable-next-line no-unused-vars
  onSubmitError?: (failedAnswer: string) => void;
};

export function useSubmitInterviewAnswer({
  cur_question,
  cur_question_id,
  prev_questions_and_answers,
  updateInterviewData,
  setInterviewerEmotion,
  playAudio,
  onAnswerSubmitted,
  onSubmitError
}: UseSubmitInterviewAnswerOptions) {
  const { info: infoToast, error: errorToast } = useToast();
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const analyzingToastRef = useRef<{ dismiss: () => void } | null>(null);

  const clearAnalyzingHint = (): void => {
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }
    analyzingToastRef.current?.dismiss();
    analyzingToastRef.current = null;
  };

  const mutation = useMutation({
    mutationFn: (data: InterviewAnswerFormType) => {
      return submitInterviewAnswerV2(data).then(() =>
        getInterviewAnswerV2({
          interviewId: data.interviewId,
          questionId: data.questionId,
          mode: data.mode
        })
      );
    },
    onMutate: (data) => {
      clearAnalyzingHint();
      delayTimerRef.current = setTimeout(() => {
        analyzingToastRef.current = infoToast({
          title: "면접관이 답변을 분석 중이에요",
          description: "잠시만 기다려주세요. 곧 다음 질문이 준비됩니다.",
          duration: 8000,
          position: "top-center"
        });
      }, ANALYZING_HINT_DELAY_MS);

      publishInterviewEvent("interview:stopVoiceRecognition");
      captureFormSubmitEvent({
        name: "submitInterviewAnswer",
        properties: {
          question: cur_question,
          answer: data.answer,
          question_id: data.questionId
        }
      });
      updateInterviewData({
        prev_questions_and_answers: [
          ...prev_questions_and_answers,
          {
            question: cur_question,
            answer: data.answer,
            question_id: cur_question_id,
            answer_id: 0
          }
        ]
      });
      return { previousQuestions: prev_questions_and_answers };
    },
    onSuccess: (data, variables) => {
      clearAnalyzingHint();

      if (data.interviewState === "FINISHED") {
        updateInterviewData({
          interview_state: "FINISHED",
          cur_question: FINISHED_MESSAGE
        });
        onAnswerSubmitted?.(variables.answer);
        return;
      }
      setInterviewerEmotion(getEmotion(data.curAnswerRank));
      const nextQuestion = (): Partial<Interview> => {
        if ("nextQuestionVoiceUrl" in data)
          return { cur_question_voice_url: data.nextQuestionVoiceUrl };
        return { cur_question: data.nextQuestion ?? "" };
      };
      updateInterviewData({
        ...nextQuestion(),
        cur_question_id: data.nextQuestionId
      });
      if (data.nextQuestionVoiceUrl) {
        // 재생 실패가 답변 제출 흐름을 깨지 않도록 한다
        playAudio(data.nextQuestionVoiceUrl).catch(() => {});
      }
      onAnswerSubmitted?.(variables.answer);
    },
    onError: (_error, variables, context) => {
      clearAnalyzingHint();

      // 낙관적으로 추가한 답변만 되돌린다. 질문 텍스트는 건드리지 않는다.
      updateInterviewData({
        prev_questions_and_answers:
          context?.previousQuestions ?? prev_questions_and_answers
      });

      errorToast({
        title: "답변을 제출하지 못했어요",
        description: "네트워크 상태를 확인한 뒤 다시 시도해주세요.",
        duration: 5000,
        position: "top-center"
      });

      onSubmitError?.(variables.answer);
    },
    retry: false
  });

  useEffect(() => {
    return () => {
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
      }
    };
  }, []);

  return mutation;
}
