import { Interview, InterviewMode } from "@kokomen/types";
import { useSpeechRecognitionWithEvents } from "@/domains/interview/hooks/useSpeechRecognitionWithEvents";
import { useSubmitInterviewAnswer } from "@/domains/interview/hooks/useSubmitInterviewAnswer";
import { useInterviewDraftGuard } from "@/domains/interview/hooks/useInterviewDraftGuard";
import {
  clearAnswerDraft,
  readAnswerDraft,
  useAnswerDraft
} from "@/domains/interview/hooks/useAnswerDraft";
import type { InterviewerEmotion } from "@kokomen/types";
import { Button, Textarea, useToast } from "@kokomen/ui";
import { RecordingIndicator } from "@kokomen/ui/domains";
import { RotateCcw } from "lucide-react";
import React, { JSX, useCallback, useEffect, useRef, useState } from "react";
import { publishInterviewEvent } from "@/domains/interview/utils/interviewEventEmitter";
import { InterviewTimer } from "@/domains/interview/components/interviewTimer";
import { useAppendOnlyAnswerInput } from "@/domains/interview/hooks/useAppendOnlyAnswerInput";
import { ANSWER_TIME_LIMIT_SECONDS } from "@/domains/interview/constants";

const TIMEOUT_EMPTY_ANSWER = "시간 초과로 답을 적지 못했습니다";

export type UseInterviewAnswerOptions = Pick<
  Interview,
  "cur_question_id" | "prev_questions_and_answers"
> & {
  isInterviewStarted: boolean;
  cur_question: string;
  // eslint-disable-next-line no-unused-vars
  updateInterviewData: (updates: Partial<Interview>) => void;
  interviewId: number | string;
  setIsListening: React.Dispatch<React.SetStateAction<boolean>>;
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

/**
 * 기본 면접(텍스트 · 음성)의 답변 입력 상태.
 *
 * 면접실 개편으로 입력창은 작업 영역에, 제출 · 음성 입력 버튼은 조작 바에 따로 놓인다.
 * 둘이 같은 상태를 봐야 해서 예전 InterviewAnswerForm 의 동작을 훅으로 옮겼다.
 * 작성 중인 답변은 면접 · 질문별 초안으로 저장하고, 새로고침하면 되살린다.
 */
export function useInterviewAnswer({
  isInterviewStarted,
  cur_question,
  cur_question_id,
  prev_questions_and_answers,
  updateInterviewData,
  interviewId,
  setIsListening,
  setInterviewerEmotion,
  playAudio,
  mode,
  isFinished,
  isInterviewerSpeaking,
  isTimeLimitEnabled,
  isAppendOnlyEnabled
}: UseInterviewAnswerOptions) {
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

  const progressKey = String(cur_question_id);
  const { isSaved: isDraftSaved } = useAnswerDraft({
    interviewId,
    progressKey,
    value: interviewInput,
    isEmpty: !hasAnswer,
    enabled: isInterviewStarted && !isFinished
  });

  const updateInterviewInput = useCallback(
    (result: string) => {
      if (!isInterviewStarted) return;
      setInterviewInput(result);
    },
    [setInterviewInput, isInterviewStarted]
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
      clearAnswerDraft(interviewId);
    },
    onSubmitError: (answer) => {
      // 실패한 답변은 그대로 남겨두고 재시도 배너를 띄운다
      setFailedAnswer(answer);
      setTimerGeneration((prev) => prev + 1);
    }
  });

  // 질문이 바뀌면 누적된 음성 인식 결과를 비우고, 이 질문의 초안이 있으면 되살린다
  useEffect(() => {
    resetTranscript();
    setFailedAnswer(null);
    const draft = readAnswerDraft<string>(interviewId, String(cur_question_id));
    if (draft) {
      setInterviewInput(draft);
      seedTranscript(draft);
    }
  }, [
    cur_question_id,
    interviewId,
    resetTranscript,
    seedTranscript,
    setInterviewInput
  ]);

  useEffect(() => {
    if (isFinished) clearAnswerDraft(interviewId);
  }, [isFinished, interviewId]);

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

  const startVoiceInput = useCallback(() => {
    publishInterviewEvent("interview:startVoiceRecognition");
  }, []);
  const stopVoiceInput = useCallback(() => {
    publishInterviewEvent("interview:stopVoiceRecognition");
  }, []);

  return {
    mode,
    textAreaRef,
    value: interviewInput,
    hasAnswer,
    isPending,
    isInputDisabled,
    isInterviewStarted,
    isFinished,
    isDraftSaved,
    failedAnswer,
    answeredCount,
    isVoiceListening,
    voiceError,
    submit: () => submitAnswer(interviewInput),
    retry: () => {
      if (failedAnswer !== null) submitAnswer(failedAnswer);
    },
    startVoiceInput,
    stopVoiceInput,
    setIsListening,
    textareaHandlers: {
      onChange: handleManualChange,
      onCompositionStart: handleCompositionStart,
      onCompositionEnd: handleCompositionEnd,
      onCut: handleCut,
      onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // 삭제/잘라내기 키로 입력한 답변을 지울 수 없도록 차단(조합 중은 허용)
        if (guardDeletionKeyDown(e)) return;
        if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
          e.preventDefault();
          submitAnswer(interviewInput);
        }
      }
    },
    timer: isTimeLimitEnabled
      ? {
          key: `${cur_question_id}-${timerGeneration}`,
          isActive:
            isInterviewStarted &&
            !isPending &&
            !isFinished &&
            !isInterviewerSpeaking,
          onTimeout: handleTimeout
        }
      : null
  };
}

export type InterviewAnswerController = ReturnType<typeof useInterviewAnswer>;

/** 답변 입력창. 텍스트 면접은 작업 영역을 채우고, 음성 면접은 인식된 답을 짧게 보여준다. */
export function AnswerTextarea({
  answer,
  compact = false
}: {
  answer: InterviewAnswerController;
  compact?: boolean;
}): JSX.Element {
  return (
    <Textarea
      ref={answer.textAreaRef}
      role="textbox"
      aria-label="interview-answer"
      variant={"default"}
      name="interview-answer"
      className={`block w-full resize-none text-base transition-colors ${
        compact
          ? "min-h-[72px] max-h-[120px]"
          : "min-h-[200px] flex-1 lg:min-h-0"
      } ${answer.isVoiceListening ? "bg-bg-text-hover motion-safe:animate-pulse" : ""}`}
      rows={compact ? 2 : 6}
      {...answer.textareaHandlers}
      value={answer.value}
      disabled={answer.isInputDisabled}
      aria-disabled={answer.isInputDisabled}
      placeholder={
        answer.mode === "VOICE"
          ? "말씀하시면 자동으로 입력돼요. 잘못 인식된 부분은 직접 고칠 수 있어요."
          : "답변을 입력해주세요..."
      }
      onFocus={() => answer.setIsListening(true)}
      onBlur={() => answer.setIsListening(false)}
    />
  );
}

/** 조작 바 오른쪽의 제출 버튼 */
export function AnswerSubmitButton({
  answer,
  label
}: {
  answer: InterviewAnswerController;
  label: string;
}): JSX.Element {
  return (
    <Button
      type="button"
      aria-label="interview-submit"
      name="interview-submit"
      size="large"
      variant="primary"
      className="min-w-32 md:min-w-48"
      disabled={!answer.hasAnswer || !answer.isInterviewStarted || answer.isPending}
      aria-busy={answer.isPending}
      pendingSpinner={answer.isPending}
      pendingText="제출 중.."
      onClick={answer.submit}
    >
      {label}
    </Button>
  );
}

/** 질문과 입력창 사이의 안내: 제한 시간 · 제출 실패 · 음성 인식 상태 */
export function AnswerNotices({
  answer
}: {
  answer: InterviewAnswerController;
}): JSX.Element | null {
  const timer = answer.timer;
  const showVoiceStatus =
    answer.mode === "TEXT" && (answer.isVoiceListening || answer.voiceError);
  if (!timer && answer.failedAnswer === null && !showVoiceStatus) return null;

  return (
    <div className="flex flex-col gap-2">
      {/*
        질문이 바뀌거나 제출이 실패하면 타이머를 리마운트해서 리셋한다.
        설정을 켠 순간에도 새로 마운트되므로 제한 시간이 그 시점부터 다시 시작된다.
      */}
      {timer && (
        <InterviewTimer
          key={timer.key}
          durationSeconds={ANSWER_TIME_LIMIT_SECONDS}
          isActive={timer.isActive}
          onTimeout={timer.onTimeout}
        />
      )}
      {answer.failedAnswer !== null && (
        <div
          role="alert"
          className="flex flex-col gap-2 rounded-lg border border-red-2 bg-error-bg px-3 py-2 sm:flex-row sm:items-center"
        >
          <span className="flex-1 text-sm text-error">
            답변을 제출하지 못했어요. 입력한 내용은 그대로 남아 있습니다.
          </span>
          <Button
            type="button"
            variant={"secondary"}
            size={"small"}
            aria-label="interview-retry-submit"
            onClick={answer.retry}
            disabled={answer.isPending}
            className="flex shrink-0 items-center gap-1.5"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            다시 시도
          </Button>
        </div>
      )}
      {answer.mode === "TEXT" && answer.isVoiceListening && (
        <RecordingIndicator isRecording label="면접관님이 듣고 있어요" />
      )}
      {answer.mode === "TEXT" && answer.voiceError && !answer.isVoiceListening && (
        <p role="status" aria-live="polite" className="text-sm text-error">
          {answer.voiceError}
        </p>
      )}
    </div>
  );
}
