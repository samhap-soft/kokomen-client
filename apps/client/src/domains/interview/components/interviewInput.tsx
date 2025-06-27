import { submitInterviewAnswer } from "@/domains/interview/api/interviewAnswer";
import {
  IInterviewState,
  InterviewActions,
} from "@/domains/interview/hooks/useInterviewStatus";
import { Button } from "@kokomen/ui/components/button";
import { Textarea } from "@kokomen/ui/components/textarea/textarea";
import { useMutation } from "@tanstack/react-query";
import { ArrowBigUp } from "lucide-react";
import { useRouter } from "next/router";
import React, { JSX, useState } from "react";

export function InterviewAnswerInput({
  interviewState,
  interviewId,
  dispatch,
  setIsListening,
}: {
  interviewState: IInterviewState;
  dispatch: InterviewActions;
  interviewId: string;
  setIsListening: React.Dispatch<React.SetStateAction<boolean>>;
}): JSX.Element {
  const [interviewInput, setInterviewInput] = useState<string>("");
  const router = useRouter();
  const { mutate } = useMutation({
    mutationFn: submitInterviewAnswer,
    onMutate: () => {
      const previousMessage = {
        prevMessage: interviewState.message,
        prevQuestionId: interviewState.currentQuestionId,
      };
      dispatch({ type: "ANSWER_QUESTION" });
      return {
        previousMessage,
      };
    },
    onSuccess: ({ status, data }) => {
      if (status === 204) {
        dispatch({ type: "INTERVIEW_END" });
        setTimeout(() => {
          router.push(`/interviews/${interviewId}/result`);
        }, 2000);
        return;
      }
      dispatch({
        type: "QUESTION",
        message: data.next_question,
        currentQuestionId: data.next_question_id,
      });
    },
    onError: (_, __, context) => {
      dispatch({ type: "SUBMIT_FAILED" });
      setTimeout(() => {
        if (context?.previousMessage) {
          // 이전 상태로 복원
          dispatch({
            type: "QUESTION",
            message: context.previousMessage.prevMessage,
            currentQuestionId: context.previousMessage.prevQuestionId,
          });
        }
      }, 2000);
    },
  });

  return (
    <div className="bottom-10 gap-3 p-4 items-center w-full border border-border-secondary rounded-xl bg-bg-base">
      <Textarea
        variant={"default"}
        name="interview-input"
        border={"none"}
        className={`transition-all block w-full resize-none border-none focus:border-none max-h-[250px]`}
        rows={1}
        onChange={(e) => setInterviewInput(e.target.value)}
        value={interviewInput}
        autoAdjust={true}
        disabled={interviewState.status === "standby"}
        placeholder={"답변을 입력해주세요..."}
        onFocus={() => setIsListening(true)}
        onBlur={() => setIsListening(false)}
      />
      <div className="flex w-full gap-5">
        <div className="flex-1"></div>
        <Button
          round
          className={`w-[50px] h-[50px] disabled:opacity-50 disabled:pointer-events-none transition-opacity duration-200`}
          disabled={
            interviewState.status !== "question" || !interviewInput.length
          }
          onClick={() =>
            mutate({
              interviewId: interviewId,
              questionId: interviewState.currentQuestionId,
              answer: interviewInput,
            })
          }
          variant={"primary"}
        >
          <ArrowBigUp className="text-primary-content" />
        </Button>
      </div>
    </div>
  );
}
