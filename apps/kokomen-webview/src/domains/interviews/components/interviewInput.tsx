import { Button } from "@kokomen/ui";
import { Textarea } from "@kokomen/ui";
import { useMutation } from "@tanstack/react-query";
import { ArrowBigUp, CircleStop, Mic } from "lucide-react";
import React, { JSX, MouseEvent, useCallback, useRef, useState } from "react";
import type { CamelCasedProperties } from "@kokomen/utils";
import { Interview } from "@kokomen/types";
import { useRouter } from "@tanstack/react-router";
import { submitInterviewAnswer } from "@/domains/interviews/api/interviewAnswer";
import useSpeechRecognition from "@/domains/interviews/hooks/useSpeechRecognition";

type InterviewInputProps = Pick<
  CamelCasedProperties<Interview>,
  "curQuestion" | "curQuestionId" | "prevQuestionsAndAnswers"
> & {
  isInterviewStarted: boolean;
  updateInterviewData: (
    // eslint-disable-next-line no-unused-vars
    updates: Partial<CamelCasedProperties<Interview>>
  ) => void;
  interviewId: number;
  setIsListening: React.Dispatch<React.SetStateAction<boolean>>;
  totalQuestions: number;
};
const SUBMIT_FAILED_MESSAGE: string =
  "제출 중 오류가 발생했습니다. 다시 시도해주세요.";
const FINISHED_MESSAGE: string = "면접이 종료되었습니다. 수고하셨습니다.";
export function InterviewAnswerInput({
  isInterviewStarted,
  curQuestion,
  curQuestionId,
  prevQuestionsAndAnswers,
  updateInterviewData,
  interviewId,
  setIsListening,
  totalQuestions
}: InterviewInputProps): JSX.Element {
  const [interviewInput, setInterviewInput] = useState<string>("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const updateInterviewInput = useCallback(
    (result: string) => {
      setInterviewInput(result);
      if (textAreaRef.current) {
        textAreaRef.current.style.height = "auto";
        textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight > 400 ? 400 : textAreaRef.current.scrollHeight}px`;
      }
    },
    [setInterviewInput]
  );
  const {
    startListening,
    isListening: isVoiceListening,
    stopListening,
    isSupported
  } = useSpeechRecognition((result) => {
    updateInterviewInput(result);
  });
  const router = useRouter();
  const { mutate, isPending } = useMutation({
    mutationFn: submitInterviewAnswer,
    onMutate: () => {
      //TODO: 모니터링 커스텀 이벤트 부착
      // captureFormSubmitEvent({
      //   name: "submitInterviewAnswer",
      //   properties: {
      //     question: cur_question,
      //     answer: data.answer,
      //     question_id: data.questionId,
      //   },
      // });
      const previousMessage = {
        prevMessage: curQuestion,
        prevQuestionId: curQuestionId
      };
      updateInterviewData({
        prevQuestionsAndAnswers: [
          ...prevQuestionsAndAnswers,
          {
            question: curQuestion,
            answer: interviewInput,
            questionId: curQuestionId,
            answerId: 0
          }
        ]
      });
      return {
        previousMessage
      };
    },
    onSuccess: ({ status, data }) => {
      if (status === 204) {
        updateInterviewData({
          interviewState: "FINISHED",
          curQuestion: FINISHED_MESSAGE
        });
        setTimeout(() => {
          router.navigate({
            to: `/interviews/${interviewId}/result`,
            replace: true,
            viewTransition: true
          });
        }, 2000);
        return;
      }
      updateInterviewData({
        curQuestion: data.next_question,
        curQuestionId: data.next_question_id
      });
      setInterviewInput("");
    },
    onError: (_, __, context) => {
      updateInterviewData({
        curQuestion: SUBMIT_FAILED_MESSAGE
      });
      setTimeout(() => {
        if (context?.previousMessage) {
          // 이전 상태로 복원
          updateInterviewData({
            curQuestion: context?.previousMessage?.prevMessage,
            prevQuestionsAndAnswers: prevQuestionsAndAnswers.filter(
              (q) => q.questionId !== context?.previousMessage?.prevQuestionId
            ),
            curQuestionId: context?.previousMessage?.prevQuestionId
          });
        }
      }, 2000);
    },
    retry: false
  });

  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement> | MouseEvent<HTMLButtonElement>
  ): void => {
    e.preventDefault();
    if (!isPending && isInterviewStarted) {
      mutate({
        interviewId: interviewId,
        questionId: curQuestionId,
        answer: interviewInput
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
        className={`transition-all block w-full resize-none border-none focus:border-none max-h-[250px] mb-2 ${
          isVoiceListening ? "bg-bg-text-hover animate-pulse" : ""
        }`}
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
            setIsListening(false);
            mutate({
              interviewId: interviewId,
              questionId: curQuestionId,
              answer: interviewInput
            });
          }
        }}
        value={interviewInput}
        autoAdjust={true}
        disabled={isPending || !isInterviewStarted || isVoiceListening}
        aria-disabled={isPending || !isInterviewStarted || isVoiceListening}
        placeholder={"답변을 입력해주세요..."}
        onFocus={() => setIsListening(true)}
        onBlur={() => setIsListening(false)}
      />
      <div className="flex w-full gap-5">
        <div className="flex-1 items-center flex gap-5 justify-between">
          <span className="text-text-tertiary font-bold">
            {prevQuestionsAndAnswers.length} / {totalQuestions}
          </span>
          {isVoiceListening ? (
            <Button
              type="button"
              role="button"
              aria-label="interview-voice-stop"
              name="interview-voice-stop"
              variant={"glass"}
              className="flex items-center gap-2 text-text-tertiary"
              onClick={() => {
                setIsListening(false);
                stopListening();
              }}
              disabled={!isVoiceListening || isPending || !isInterviewStarted}
            >
              <CircleStop
                className={`${isVoiceListening ? "animate-pulse text-volcano-6" : ""}`}
              />
              <span className="text-text-tertiary font-bold">중지</span>
            </Button>
          ) : (
            <Button
              type="button"
              role="button"
              aria-label="interview-voice-start"
              name="interview-voice-start"
              variant={"glass"}
              className="flex items-center gap-2 text-text-tertiary"
              onClick={() => {
                setIsListening(true);
                startListening();
              }}
              disabled={
                isVoiceListening ||
                isPending ||
                !isInterviewStarted ||
                !isSupported
              }
            >
              <Mic className={`${isVoiceListening ? "animate-pulse" : ""}`} />

              <span className="text-text-tertiary font-bold">
                음성으로 말하기
              </span>
            </Button>
          )}
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
