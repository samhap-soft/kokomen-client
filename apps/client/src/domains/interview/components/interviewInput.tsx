import { submitInterviewAnswer } from "@/domains/interview/api/interviewAnswer";
import { Interview } from "@/domains/interview/types";
import { Button } from "@kokomen/ui/components/button";
import { Textarea } from "@kokomen/ui/components/textarea/textarea";
import { useMutation } from "@tanstack/react-query";
import { ArrowBigUp } from "lucide-react";
import { useRouter } from "next/router";
import React, { JSX, MouseEvent, useRef, useState } from "react";

type InterviewInputProps = Pick<
  Interview,
  "cur_question" | "cur_question_id" | "prev_questions_and_answers"
> & {
  isInterviewStarted: boolean;
  // eslint-disable-next-line no-unused-vars
  updateInterviewData: (updates: Partial<Interview>) => void;
  interviewId: number;
  setIsListening: React.Dispatch<React.SetStateAction<boolean>>;
  totalQuestions: number;
};
const SUBMIT_FAILED_MESSAGE: string =
  "제출 중 오류가 발생했습니다. 다시 시도해주세요.";
export function InterviewAnswerInput({
  isInterviewStarted,
  cur_question,
  cur_question_id,
  prev_questions_and_answers,
  updateInterviewData,
  interviewId,
  setIsListening,
  totalQuestions,
}: InterviewInputProps): JSX.Element {
  const [interviewInput, setInterviewInput] = useState<string>("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const { mutate, isPending } = useMutation({
    mutationFn: submitInterviewAnswer,
    onMutate: () => {
      const previousMessage = {
        prevMessage: cur_question,
        prevQuestionId: cur_question_id,
      };
      updateInterviewData({
        prev_questions_and_answers: [
          ...prev_questions_and_answers,
          {
            question: cur_question,
            answer: interviewInput,
            question_id: cur_question_id,
            answer_id: 0,
          },
        ],
      });
      return {
        previousMessage,
      };
    },
    onSuccess: ({ status, data }) => {
      if (status === 204) {
        setTimeout(() => {
          router.push(`/interviews/${interviewId}/result`);
        }, 2000);
        return;
      }
      updateInterviewData({
        cur_question: data.next_question,
        cur_question_id: data.next_question_id,
      });
      setInterviewInput("");
    },
    onError: (_, __, context) => {
      updateInterviewData({
        cur_question: SUBMIT_FAILED_MESSAGE,
      });
      setTimeout(() => {
        if (context?.previousMessage) {
          // 이전 상태로 복원
          updateInterviewData({
            cur_question: context?.previousMessage?.prevMessage ?? "",
          });
        }
      }, 2000);
    },
    retry: false,
  });

  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement> | MouseEvent<HTMLButtonElement>
  ): void => {
    e.preventDefault();
    if (!isPending && isInterviewStarted) {
      mutate({
        interviewId: interviewId,
        questionId: cur_question_id,
        answer: interviewInput,
      });
    }
  };

  return (
    <form className="bottom-10 gap-3 p-4 items-center w-full border border-border-secondary rounded-xl bg-bg-base">
      <Textarea
        ref={textAreaRef}
        role="textbox"
        aria-label="interview-answer"
        variant={"default"}
        name="interview-answer"
        border={"none"}
        className={`transition-all block w-full resize-none border-none focus:border-none max-h-[250px]`}
        rows={1}
        onChange={(e) => setInterviewInput(e.target.value)}
        onKeyDown={(e) => {
          if (
            e.key === "Enter" &&
            !e.shiftKey &&
            !isPending &&
            isInterviewStarted
          ) {
            e.preventDefault();
            mutate({
              interviewId: interviewId,
              questionId: cur_question_id,
              answer: interviewInput,
            });
          }
        }}
        value={interviewInput}
        autoAdjust={true}
        disabled={isPending || !isInterviewStarted}
        placeholder={"답변을 입력해주세요..."}
        onFocus={() => setIsListening(true)}
        onBlur={() => setIsListening(false)}
      />
      <div className="flex w-full gap-5">
        <div className="flex-1 items-center flex">
          <span className="text-text-tertiary font-bold">
            {prev_questions_and_answers.length} / {totalQuestions}
          </span>
        </div>
        <Button
          type="submit"
          role="button"
          aria-label="interview-submit"
          name="interview-submit"
          round
          className={`w-[50px] h-[50px] disabled:opacity-50 disabled:pointer-events-none transition-opacity duration-200`}
          disabled={!interviewInput.length || !isInterviewStarted || isPending}
          onClick={handleSubmit}
          variant={"primary"}
        >
          <ArrowBigUp className="text-primary-content" />
        </Button>
      </div>
    </form>
  );
}
