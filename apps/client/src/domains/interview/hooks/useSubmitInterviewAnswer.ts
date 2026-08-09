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

const SUBMIT_FAILED_MESSAGE = "제출 중 오류가 발생했습니다. 다시 시도해주세요.";
const FINISHED_MESSAGE = "면접이 종료되었습니다. 수고하셨습니다.";

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
};

export function useSubmitInterviewAnswer({
  cur_question,
  cur_question_id,
  prev_questions_and_answers,
  updateInterviewData,
  setInterviewerEmotion,
  playAudio,
  onAnswerSubmitted
}: UseSubmitInterviewAnswerOptions) {
  const { info: infoToast } = useToast();
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
      delayTimerRef.current = setTimeout(() => {
        infoToast({
          title: "면접관이 답변을 분석 중이에요",
          description: "잠시만 기다려주세요. 곧 다음 질문이 준비됩니다.",
          duration: 5000,
          position: "top-center"
        });
      }, 5000);

      publishInterviewEvent("interview:stopVoiceRecognition");
      captureFormSubmitEvent({
        name: "submitInterviewAnswer",
        properties: {
          question: cur_question,
          answer: data.answer,
          question_id: data.questionId
        }
      });
      const previousMessage = {
        prevMessage: cur_question,
        prevQuestionId: cur_question_id
      };
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
      return {
        previousMessage
      };
    },
    onSuccess: (data, variables) => {
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
        delayTimerRef.current = null;
      }
      if (data.interviewState === "FINISHED") {
        updateInterviewData({
          interview_state: "FINISHED",
          cur_question: FINISHED_MESSAGE
        });
        return;
      }
      setInterviewerEmotion(getEmotion(data.curAnswerRank));
      const updatedata = () => {
        if ("nextQuestionVoiceUrl" in data)
          return { cur_question_voice_url: data.nextQuestionVoiceUrl };
        return { cur_question: data.nextQuestion ?? "" };
      };
      updateInterviewData({
        ...updatedata(),
        cur_question_id: data.nextQuestionId
      });
      if (data.nextQuestionVoiceUrl) {
        // 재생 실패가 답변 제출 흐름을 깨지 않도록 한다
        playAudio(data.nextQuestionVoiceUrl).catch(() => {});
      }
      onAnswerSubmitted?.(variables.answer);
    },
    onError: (_, __, context) => {
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
        delayTimerRef.current = null;
      }
      updateInterviewData({
        cur_question: SUBMIT_FAILED_MESSAGE,
        prev_questions_and_answers: [
          ...prev_questions_and_answers.filter(
            (question) => question.question_id !== cur_question_id
          )
        ]
      });

      setTimeout(() => {
        if (context?.previousMessage) {
          updateInterviewData({
            cur_question: context?.previousMessage?.prevMessage ?? ""
          });
        }
      }, 1000);
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
