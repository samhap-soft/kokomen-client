import { Interview, InterviewMode } from "@kokomen/types";
import { useSpeechRecognitionWithEvents } from "@/domains/interview/hooks/useSpeechRecognitionWithEvents";
import { useSubmitInterviewAnswer } from "@/domains/interview/hooks/useSubmitInterviewAnswer";
import { useInterviewDraftGuard } from "@/domains/interview/hooks/useInterviewDraftGuard";
import type { InterviewerEmotion } from "@/pages/interviews/[interviewId]";
import { Button, LoadingCircles, Textarea, useToast } from "@kokomen/ui";
import { ArrowBigUp, CircleStop, Mic, RotateCcw } from "lucide-react";
import React, {
  JSX,
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
import { publishInterviewEvent } from "@/domains/interview/utils/interviewEventEmitter";
import { InterviewTimer } from "@/domains/interview/components/interviewTimer";
import { useAppendOnlyAnswerInput } from "@/domains/interview/hooks/useAppendOnlyAnswerInput";
import { ANSWER_TIME_LIMIT_SECONDS } from "@/domains/interview/constants";

const TIMEOUT_EMPTY_ANSWER = "시간 초과로 답을 적지 못했습니다";

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
  // 면접관이 질문을 읽어주는 중인지 여부. 이 동안에는 답변 시간이 흐르지 않는다.
  isInterviewerSpeaking: boolean;
  // 설정(면접 설정 dialog)에서 켠 경우에만 제한 시간을 적용한다
  isTimeLimitEnabled: boolean;
  // 설정에서 켠 경우에만 입력한 답변을 수정·삭제할 수 없다
  isAppendOnlyEnabled: boolean;
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
  isFinished,
  isInterviewerSpeaking,
  isTimeLimitEnabled,
  isAppendOnlyEnabled
}: InterviewInputProps): JSX.Element {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { info: infoToast, warning: warningToast } = useToast();
  // 제출 실패 후 재시도할 답변. 값이 있으면 재시도 배너를 띄운다.
  const [failedAnswer, setFailedAnswer] = useState<string | null>(null);
  /**
   * 타이머 리마운트 키의 일부. 제출이 실패하면 같은 질문을 다시 답해야 하는데,
   * cur_question_id가 그대로라 키가 바뀌지 않으면 타이머가 0:00에 멈춘 채 남는다.
   */
  const [timerGeneration, setTimerGeneration] = useState<number>(0);

  // 안내 토스트가 여러 개 쌓이지 않도록 이전 토스트를 닫고 새로 띄운다
  const blockedEditToastRef = useRef<{ dismiss: () => void } | null>(null);
  const handleBlockedEdit = useCallback(() => {
    blockedEditToastRef.current?.dismiss();
    blockedEditToastRef.current = warningToast({
      description: "이미 입력한 답변은 수정하거나 지울 수 없습니다.",
      duration: 2000,
      position: "top-center"
    });
  }, [warningToast]);

  const {
    value: interviewInput,
    setValue: setInterviewInput,
    handleChange: handleAppendOnlyChange,
    handleCompositionStart,
    handleCompositionEnd,
    handleCut,
    guardDeletionKeyDown
  } = useAppendOnlyAnswerInput({
    enabled: isAppendOnlyEnabled,
    onBlockedEdit: handleBlockedEdit
  });

  const trimmedInput = interviewInput.trim();
  const hasAnswer = trimmedInput.length > 0;

  // 작성 중인 답변이 있으면 새로고침·탭 닫기 시 확인창을 띄운다
  useInterviewDraftGuard(hasAnswer && !isFinished);

  const adjustTextAreaHeight = useCallback(() => {
    const element = textAreaRef.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight > 400 ? 400 : element.scrollHeight}px`;
  }, []);

  const updateInterviewInput = useCallback(
    (result: string) => {
      if (!isInterviewStarted) return;
      setInterviewInput(result);
      adjustTextAreaHeight();
    },
    [setInterviewInput, isInterviewStarted, adjustTextAreaHeight]
  );

  /**
   * 오래 침묵했을 때의 안내.
   * 예전에는 입력값을 비웠지만, 그러면 지금까지 말한 답변이 그대로 사라졌다.
   * 이제는 이어서 말하도록 안내만 하고 답변은 그대로 둔다.
   */
  const handleSilenceHint = useCallback(() => {
    infoToast({
      description:
        "말씀이 잠시 끊겼어요. 이어서 말씀하시거나 제출 버튼을 눌러주세요.",
      duration: 4000,
      position: "top-center"
    });
  }, [infoToast]);

  const {
    isListening: isVoiceListening,
    error: voiceError,
    resetTranscript,
    seedTranscript
  } = useSpeechRecognitionWithEvents({
    onSpeechEnd: updateInterviewInput,
    onSilenceHint: handleSilenceHint,
    enabled: isInterviewStarted && !isFinished,
    mode: mode
  });

  const { mutate, isPending } = useSubmitInterviewAnswer({
    cur_question,
    cur_question_id,
    prev_questions_and_answers,
    updateInterviewData,
    setInterviewerEmotion,
    playAudio,
    onAnswerSubmitted: () => {
      setInterviewInput("");
      resetTranscript();
      setFailedAnswer(null);
    },
    onSubmitError: (answer) => {
      // 실패한 답변은 그대로 남겨두고 재시도 배너를 띄운다
      setFailedAnswer(answer);
      setTimerGeneration((prev) => prev + 1);
    }
  });

  // 질문이 바뀌면 누적된 음성 인식 결과도 함께 비운다
  useEffect(() => {
    resetTranscript();
    setFailedAnswer(null);
  }, [cur_question_id, resetTranscript]);

  const submitAnswer = useCallback(
    (answer: string) => {
      if (isPending || !isInterviewStarted || isFinished) return;
      if (answer.trim().length === 0) return;

      setIsListening(false);
      setFailedAnswer(null);
      mutate({
        interviewId: interviewId,
        questionId: cur_question_id,
        answer: answer,
        mode: mode as InterviewMode
      });
    },
    [
      isPending,
      isInterviewStarted,
      isFinished,
      setIsListening,
      mutate,
      interviewId,
      cur_question_id,
      mode
    ]
  );

  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement> | MouseEvent<HTMLButtonElement>
  ): void => {
    e.preventDefault();
    submitAnswer(interviewInput);
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
    submitAnswer(
      interviewInput.trim().length > 0 ? interviewInput : TIMEOUT_EMPTY_ANSWER
    );
  }, [
    isPending,
    isInterviewStarted,
    isFinished,
    setIsListening,
    infoToast,
    submitAnswer,
    interviewInput
  ]);

  /**
   * 사용자가 직접 고친 내용을 음성 인식의 새 기준값으로 삼는다.
   * 이렇게 하지 않으면 다음 인식 결과가 수정한 내용을 덮어써서
   * 음성 인식이 잘못 알아들은 부분을 고칠 수 없다.
   */
  const handleManualChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const nextValue = e.target.value;
      handleAppendOnlyChange(e);
      seedTranscript(nextValue);
    },
    [handleAppendOnlyChange, seedTranscript]
  );

  // 음성 인식 중에는 입력이 계속 덮어써지므로 직접 수정할 수 없다.
  // 인식이 멈춘 동안에는 VOICE 모드에서도 잘못 인식된 답변을 고칠 수 있어야 한다.
  const isInputDisabled =
    isPending || !isInterviewStarted || isFinished || isVoiceListening;

  const answeredCount = prev_questions_and_answers.length;
  // 첫 질문에서 0/N으로 보이지 않도록 "지금 답하는 질문" 기준으로 표시한다
  const currentQuestionNumber = isFinished
    ? answeredCount
    : Math.min(answeredCount + 1, totalQuestions);

  return (
    <>
      {/*
        질문이 바뀌거나 제출이 실패하면 타이머를 리마운트해서 리셋한다.
        설정을 켠 순간에도 새로 마운트되므로 제한 시간이 그 시점부터 다시 시작된다.
      */}
      {isTimeLimitEnabled && (
        <InterviewTimer
          key={`${cur_question_id}-${timerGeneration}`}
          durationSeconds={ANSWER_TIME_LIMIT_SECONDS}
          isActive={
            isInterviewStarted &&
            !isPending &&
            !isFinished &&
            !isInterviewerSpeaking
          }
          onTimeout={handleTimeout}
        />
      )}
      <form
        onSubmit={handleSubmit}
        className="gap-3 p-3 sm:p-4 items-center w-full border border-border-secondary rounded-xl bg-bg-base"
      >
        {failedAnswer !== null && (
          <div
            role="alert"
            className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2 px-3 py-2 rounded-lg border border-error-border bg-error-bg"
          >
            <span className="flex-1 text-sm text-error">
              답변을 제출하지 못했어요. 입력한 내용은 그대로 남아 있습니다.
            </span>
            <Button
              type="button"
              variant={"default"}
              size={"small"}
              aria-label="interview-retry-submit"
              onClick={() => submitAnswer(failedAnswer)}
              disabled={isPending}
              className="flex items-center gap-1.5 shrink-0"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              다시 시도
            </Button>
          </div>
        )}

        <Textarea
          ref={textAreaRef}
          role="textbox"
          aria-label="interview-answer"
          variant={"default"}
          name="interview-answer"
          border={"none"}
          className={`transition-all block w-full resize-none border-none focus:border-none max-h-[180px] sm:max-h-[250px] mb-2 ${
            isVoiceListening ? "bg-bg-text-hover motion-safe:animate-pulse" : ""
          }`}
          rows={1}
          onChange={handleManualChange}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onCut={handleCut}
          onKeyDown={(e) => {
            // 삭제/잘라내기 키로 입력한 답변을 지울 수 없도록 차단(조합 중은 허용)
            if (guardDeletionKeyDown(e)) return;
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submitAnswer(interviewInput);
            }
          }}
          value={interviewInput}
          autoAdjust={true}
          disabled={isInputDisabled}
          aria-disabled={isInputDisabled}
          placeholder={
            mode === "VOICE"
              ? "말씀하시면 자동으로 입력돼요. 잘못 인식된 부분은 직접 고칠 수 있어요."
              : "답변을 입력해주세요..."
          }
          onFocus={() => setIsListening(true)}
          onBlur={() => setIsListening(false)}
        />
        <div className="relative flex w-full gap-3 sm:gap-5">
          <div className="flex-1 items-center flex gap-3 sm:gap-5 justify-between min-w-0">
            <span
              className="text-text-tertiary font-bold text-sm sm:text-base shrink-0"
              aria-label={`전체 ${totalQuestions}개 중 ${currentQuestionNumber}번째 질문`}
            >
              {currentQuestionNumber} / {totalQuestions}
            </span>
            {isVoiceListening && (
              <div className="absolute -top-1 sm:top-0 left-1/2 -translate-x-1/2 transition-all duration-300 ease-in-out overflow-hidden motion-safe:animate-fade-in-up">
                <div className="flex items-center justify-center">
                  <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-4 to-blue-5 rounded-full">
                    <div className="flex space-x-1">
                      <LoadingCircles size="xs" />
                    </div>
                    <span className="text-text-light-solid font-semibold text-xs sm:text-sm tracking-wide whitespace-nowrap">
                      🎤 면접관님이 듣고있어요!
                    </span>
                  </div>
                </div>
              </div>
            )}
            {voiceError && !isVoiceListening && (
              <div
                role="status"
                aria-live="polite"
                className="absolute -top-1 sm:top-0 left-1/2 -translate-x-1/2 transition-all duration-300 ease-in-out overflow-hidden motion-safe:animate-fade-in-up"
              >
                <div className="flex items-center justify-center">
                  <div className="flex items-center gap-3 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-error-bg to-error-bg-hover rounded-full border border-error-border shadow-lg">
                    <span className="text-error font-semibold text-xs sm:text-sm tracking-wide whitespace-nowrap">
                      ❌ {voiceError}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <VoiceInputButton
              isVoiceListening={isVoiceListening}
              disabled={isPending || !isInterviewStarted || isFinished}
              mode={mode as InterviewMode}
            />
          </div>
          <Button
            type="submit"
            role="button"
            aria-label="interview-submit"
            name="interview-submit"
            round
            className="w-[44px] h-[44px] sm:w-[50px] sm:h-[50px] shrink-0 disabled:opacity-50 disabled:pointer-events-none transition-opacity duration-200"
            disabled={!hasAnswer || !isInterviewStarted || isPending}
            pendingSpinner={isPending}
            onClick={handleSubmit}
            variant={"primary"}
          >
            {!isPending && <ArrowBigUp className="text-primary-content" />}
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
          className="motion-safe:animate-pulse text-volcano-6"
          aria-hidden="true"
        />
        <span className="text-text-tertiary font-bold hidden sm:inline">
          중지
        </span>
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
      <Mic aria-hidden="true" />
      <span className="text-text-tertiary font-bold hidden sm:inline">
        음성으로 말하기
      </span>
    </Button>
  );
}
