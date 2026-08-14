import { Interview, InterviewMode } from "@kokomen/types";
import { useSpeechRecognitionWithEvents } from "@/domains/interview/hooks/useSpeechRecognitionWithEvents";
import { useSubmitInterviewAnswer } from "@/domains/interview/hooks/useSubmitInterviewAnswer";
import type { InterviewerEmotion } from "@/pages/interviews/[interviewId]";
import { Button, LoadingCircles, Textarea, useToast } from "@kokomen/ui";
import { ArrowBigUp, CircleStop, Mic } from "lucide-react";
import React, { JSX, MouseEvent, useCallback, useRef, useState } from "react";
import { publishInterviewEvent } from "@/domains/interview/utils/interviewEventEmitter";
import { InterviewTimer } from "@/domains/interview/components/interviewTimer";

// 질문당 답변 제한 시간(초)
const ANSWER_TIME_LIMIT_SECONDS = 90;

type InterviewInputProps = Pick<
  Interview,
  "cur_question_id" | "prev_questions_and_answers"
> & {
  isInterviewStarted: boolean;
  cur_question: string;
  // eslint-disable-next-line no-unused-vars
  updateInterviewData: (updates: Partial<Interview>) => void;
  interviewId: number | string;
  setIsListening: React.Dispatch<React.SetStateAction<boolean>>;
  totalQuestions: number;
  setInterviewerEmotion: React.Dispatch<
    React.SetStateAction<InterviewerEmotion>
  >;
  // eslint-disable-next-line no-unused-vars
  playAudio: (audioUrl?: string) => Promise<void>;
  mode: InterviewMode;
  isFinished: boolean;
};
export function InterviewAnswerForm({
  isInterviewStarted,
  cur_question,
  cur_question_id,
  prev_questions_and_answers,
  updateInterviewData,
  interviewId,
  setIsListening,
  totalQuestions,
  setInterviewerEmotion,
  playAudio,
  mode,
  isFinished
}: InterviewInputProps): JSX.Element {
  const [interviewInput, setInterviewInput] = useState<string>("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { info: infoToast } = useToast();

  const updateInterviewInput = useCallback(
    (result: string) => {
      if (!isInterviewStarted) return;
      setInterviewInput(result);
      if (textAreaRef.current) {
        textAreaRef.current.style.height = "auto";
        textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight > 400 ? 400 : textAreaRef.current.scrollHeight}px`;
      }
    },
    [setInterviewInput, isInterviewStarted]
  );

  const handleContextLost = useCallback(() => {
    setInterviewInput("");
    infoToast({
      description:
        "면접관이 맥락을 놓쳤습니다. 텀을 들이지 말고 설명해 보세요.",
      duration: 5000,
      position: "top-center"
    });
  }, [infoToast]);

  const { isListening: isVoiceListening, error: voiceError } =
    useSpeechRecognitionWithEvents({
      onSpeechEnd: updateInterviewInput,
      onContextLost: handleContextLost,
      enabled: isInterviewStarted,
      mode: mode
    });

  const { mutate, isPending } = useSubmitInterviewAnswer({
    cur_question,
    cur_question_id,
    prev_questions_and_answers,
    updateInterviewData,
    setInterviewerEmotion,
    playAudio,
    onAnswerSubmitted: () => setInterviewInput("")
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
        mode: mode as InterviewMode
      });
    }
  };

  // 제한 시간 초과 시 현재까지 입력한 답변을 자동 제출
  const handleTimeout = useCallback(() => {
    if (isPending || !isInterviewStarted || isFinished) return;
    setIsListening(false);
    infoToast({
      description: "답변 시간이 종료되어 자동으로 제출됩니다.",
      duration: 4000,
      position: "top-center"
    });
    // 아무것도 입력하지 않은 채 시간이 초과되면 미작성 답변으로 제출
    const answer =
      interviewInput.trim().length > 0
        ? interviewInput
        : "시간 초과로 답을 적지 못했습니다";
    mutate({
      interviewId: interviewId,
      questionId: cur_question_id,
      answer: answer,
      mode: mode as InterviewMode
    });
  }, [
    isPending,
    isInterviewStarted,
    isFinished,
    setIsListening,
    infoToast,
    mutate,
    interviewId,
    cur_question_id,
    interviewInput,
    mode
  ]);

  // 한 번 입력한 답변은 지울 수 없도록 이전 입력을 접두사로 유지
  const handleAppendOnlyChange = useCallback(
    (nextValue: string) => {
      setInterviewInput((prev) =>
        nextValue.startsWith(prev) ? nextValue : prev
      );
    },
    [setInterviewInput]
  );
  return (
    <>
      <InterviewTimer
        durationSeconds={ANSWER_TIME_LIMIT_SECONDS}
        resetKey={cur_question_id}
        isActive={isInterviewStarted && !isPending && !isFinished}
        onTimeout={handleTimeout}
      />
      <form className="bottom-10 gap-3 p-4 items-center w-full border border-border-secondary rounded-xl bg-bg-base">
        {/* 음성 인식 상태 표시 */}

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
        onChange={(e) => handleAppendOnlyChange(e.target.value)}
        onKeyDown={(e) => {
          // 삭제/잘라내기 키로 입력한 답변을 지울 수 없도록 차단
          const isDeletion =
            e.key === "Backspace" ||
            e.key === "Delete" ||
            ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "x");
          if (isDeletion) {
            e.preventDefault();
            return;
          }
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
              questionId: cur_question_id,
              answer: interviewInput,
              mode: mode as InterviewMode
            });
          }
        }}
        value={interviewInput}
        autoAdjust={true}
        disabled={
          isPending ||
          !isInterviewStarted ||
          isVoiceListening ||
          mode === "VOICE"
        }
        aria-disabled={isPending || !isInterviewStarted || isVoiceListening}
        placeholder={"답변을 입력해주세요..."}
        onFocus={() => setIsListening(true)}
        onBlur={() => setIsListening(false)}
      />
      <div className="relative flex w-full gap-5">
        <div className="flex-1 items-center flex gap-5 justify-between">
          <span className="text-text-tertiary font-bold">
            {prev_questions_and_answers.length} / {totalQuestions}
          </span>
          {isVoiceListening && (
            <div
              className={`absolute top-0 left-1/2 -translate-x-1/2 transition-all duration-300 ease-in-out overflow-hidden animate-fade-in-up`}
            >
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-4 to-blue-5 rounded-full">
                  <div className="flex space-x-1">
                    <LoadingCircles size="xs" />
                  </div>
                  <span className="text-text-light-solid font-semibold text-sm tracking-wide">
                    🎤 면접관님이 듣고있어요!
                  </span>
                </div>
              </div>
            </div>
          )}
          {voiceError && !isVoiceListening && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 transition-all duration-300 ease-in-out overflow-hidden animate-fade-in-up">
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-error-bg to-error-bg-hover rounded-full border border-error-border shadow-lg">
                  <span className="text-error font-semibold text-sm tracking-wide">
                    ❌ {voiceError}
                  </span>
                </div>
              </div>
            </div>
          )}

          <VoiceInputButton
            isVoiceListening={isVoiceListening}
            disabled={isPending || !isInterviewStarted}
            mode={mode as InterviewMode}
          />
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
    </>
  );
}

function VoiceInputButton({
  isVoiceListening,
  disabled,
  mode
}: {
  isVoiceListening: boolean;
  disabled: boolean;
  mode: InterviewMode;
}): JSX.Element | null {
  if (mode === "VOICE") return null;
  if (isVoiceListening) {
    return (
      <Button
        type="button"
        role="button"
        aria-label="interview-voice-stop"
        name="interview-voice-stop"
        variant={"glass"}
        className="flex items-center gap-2 text-text-tertiary"
        onClick={() => publishInterviewEvent("interview:stopVoiceRecognition")}
        disabled={disabled}
      >
        <CircleStop
          className={`${isVoiceListening ? "animate-pulse text-volcano-6" : ""}`}
        />
        <span className="text-text-tertiary font-bold">중지</span>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      role="button"
      aria-label="interview-voice-start"
      name="interview-voice-start"
      variant={"glass"}
      className="flex items-center gap-2 text-text-tertiary"
      onClick={() => publishInterviewEvent("interview:startVoiceRecognition")}
      disabled={disabled}
    >
      <Mic className={`${isVoiceListening ? "animate-pulse" : ""}`} />

      <span className="text-text-tertiary font-bold">음성으로 말하기</span>
    </Button>
  );
}
