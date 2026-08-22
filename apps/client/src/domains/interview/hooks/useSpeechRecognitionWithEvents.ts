import { useCallback, useEffect, useRef, useState } from "react";
import {
  useInterviewEvent,
  publishInterviewEvent
} from "@/domains/interview/utils/interviewEventEmitter";
import { InterviewMode } from "@kokomen/types";
import { VOICE_SILENCE_HINT_MS } from "@/domains/interview/constants";

interface UseSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
  /** 누적된 인식 결과를 모두 버린다(질문이 바뀌거나 답변을 제출한 뒤) */
  resetTranscript: () => void;
  /**
   * 사용자가 직접 고친 텍스트를 새로운 기준값으로 삼는다.
   * 이후 인식 결과는 이 값 뒤에 이어 붙는다.
   */
  // eslint-disable-next-line no-unused-vars
  seedTranscript: (text: string) => void;
}

type SpeechRecognitionType =
  | typeof window.SpeechRecognition
  | typeof window.webkitSpeechRecognition;

interface UseSpeechRecognitionProps {
  // eslint-disable-next-line no-unused-vars
  onSpeechEnd: (result: string) => void;
  /** 오래 침묵했을 때 이어서 말하도록 안내한다(입력값은 지우지 않는다) */
  onSilenceHint?: () => void;
  enabled?: boolean;
  options?: UseSpeechRecognitionOptions;
  mode: InterviewMode;
}

// 브라우저가 인식 세션을 끊은 뒤 다시 열기까지의 간격(ms)
const RESTART_DELAY_MS = 500;
const RESTART_AFTER_ERROR_MS = 2000;

export const useSpeechRecognitionWithEvents = ({
  onSpeechEnd,
  onSilenceHint,
  mode,
  enabled = true,
  options = {}
}: UseSpeechRecognitionProps): UseSpeechRecognitionReturn => {
  const {
    lang = "ko-KR",
    continuous = true,
    interimResults = true,
    maxAlternatives = 1
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  /**
   * 이미 끝난 인식 세션들의 결과. 브라우저가 침묵으로 세션을 끊어도
   * 여기 쌓인 내용은 유지되므로 지금까지 말한 답변이 사라지지 않는다.
   */
  const committedRef = useRef<string[]>([]);
  // 진행 중인 세션에서 인식된 텍스트
  const currentRef = useRef<string>("");

  const recognitionRef = useRef<InstanceType<SpeechRecognitionType> | null>(
    null
  );
  // onend 클로저가 낡은 state를 보지 않도록 ref로도 들고 있는다
  const isListeningRef = useRef<boolean>(false);
  const isStoppingRef = useRef<boolean>(false);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSpeechAtRef = useRef<number>(0);
  const silenceNotifiedRef = useRef<boolean>(false);

  const modeRef = useRef<InterviewMode>(mode);
  modeRef.current = mode;
  const enabledRef = useRef<boolean>(enabled);
  enabledRef.current = enabled;
  const onSpeechEndRef = useRef(onSpeechEnd);
  onSpeechEndRef.current = onSpeechEnd;
  const onSilenceHintRef = useRef(onSilenceHint);
  onSilenceHintRef.current = onSilenceHint;

  const buildTranscript = useCallback((): string => {
    return [...committedRef.current, currentRef.current]
      .map((segment) => segment.trim())
      .filter((segment) => segment.length > 0)
      .join(" ");
  }, []);

  const clearRestartTimer = useCallback((): void => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
  }, []);

  const resetTranscript = useCallback((): void => {
    committedRef.current = [];
    currentRef.current = "";
    silenceNotifiedRef.current = false;
    lastSpeechAtRef.current = 0;
  }, []);

  const seedTranscript = useCallback((text: string): void => {
    committedRef.current = text.trim().length > 0 ? [text] : [];
    currentRef.current = "";
    silenceNotifiedRef.current = false;
  }, []);

  const handleSpeechStart = useCallback((): void => {
    setIsListening(true);
    isListeningRef.current = true;
    setError(null);
    lastSpeechAtRef.current = Date.now();
    silenceNotifiedRef.current = false;
    publishInterviewEvent("interview:voiceRecognitionStarted");
  }, []);

  const handleSpeechResult = useCallback(
    // eslint-disable-next-line no-undef
    (event: SpeechRecognitionEvent): void => {
      if (!enabledRef.current) return;
      let resultString = "";
      for (const result of event.results) {
        if (result[0].transcript) {
          resultString += result[0].transcript;
        }
      }
      currentRef.current = resultString;
      lastSpeechAtRef.current = Date.now();
      silenceNotifiedRef.current = false;

      const transcript = buildTranscript();
      onSpeechEndRef.current(transcript);
      publishInterviewEvent("interview:voiceRecognitionResult", {
        text: transcript
      });
    },
    [buildTranscript]
  );

  const handleSpeechEnd = useCallback((): void => {
    setIsListening(false);
    isListeningRef.current = false;
    publishInterviewEvent("interview:voiceRecognitionStopped");

    // 끝난 세션의 결과를 확정해서 다음 세션이 덮어쓰지 못하게 한다
    if (currentRef.current.trim().length > 0) {
      committedRef.current.push(currentRef.current);
    }
    currentRef.current = "";

    // 사용자가 직접 중지했거나 면접이 끝난 경우에는 다시 열지 않는다
    if (isStoppingRef.current || !enabledRef.current) return;

    // VOICE 모드는 마이크가 유일한 입력 수단이므로 세션이 끊기면 곧바로 다시 연다.
    // 이때 누적 결과(committedRef)는 그대로 유지되므로 답변이 사라지지 않는다.
    if (modeRef.current === "VOICE") {
      clearRestartTimer();
      restartTimerRef.current = setTimeout(() => {
        restartTimerRef.current = null;
        publishInterviewEvent("interview:startVoiceRecognition");
      }, RESTART_DELAY_MS);
    }
  }, [clearRestartTimer]);

  const handleSpeechError = useCallback(
    // eslint-disable-next-line no-undef
    (event: SpeechRecognitionErrorEvent): void => {
      setIsListening(false);
      isListeningRef.current = false;

      if (event.error === "aborted") return;

      let errorMessage = "음성 인식 중 오류가 발생했습니다.";
      switch (event.error) {
        case "no-speech":
          errorMessage = "면접자님의 말씀이 들리지 않아요!";
          break;
        case "audio-capture":
        case "not-allowed":
          errorMessage = "마이크 접근 권한이 필요합니다.";
          break;
        case "network":
          errorMessage = "네트워크 연결 상태가 좋지 않아요.";
          break;
        default:
          errorMessage = "음성 인식 중 오류가 발생했어요.";
      }
      setError(errorMessage);
      publishInterviewEvent("interview:voiceRecognitionError", {
        error: errorMessage
      });

      // 권한 문제는 다시 시도해도 같은 결과이므로 재시작하지 않는다
      const isPermanent =
        event.error === "not-allowed" || event.error === "audio-capture";

      if (
        modeRef.current === "VOICE" &&
        !isPermanent &&
        !isStoppingRef.current &&
        enabledRef.current
      ) {
        clearRestartTimer();
        restartTimerRef.current = setTimeout(() => {
          restartTimerRef.current = null;
          publishInterviewEvent("interview:startVoiceRecognition");
        }, RESTART_AFTER_ERROR_MS);
      }

      if (!isPermanent) {
        setTimeout(() => setError(null), 2000);
      }
    },
    [clearRestartTimer]
  );

  const attachEventListeners = useCallback(
    (recognition: InstanceType<SpeechRecognitionType>): void => {
      recognition.onstart = handleSpeechStart;
      recognition.onresult = handleSpeechResult;
      recognition.onerror = handleSpeechError;
      recognition.onend = handleSpeechEnd;
    },
    [handleSpeechStart, handleSpeechResult, handleSpeechError, handleSpeechEnd]
  );

  const detachEventListeners = useCallback(
    (recognition: InstanceType<SpeechRecognitionType>): void => {
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
    },
    []
  );

  const createSpeechRecognition =
    useCallback((): InstanceType<SpeechRecognitionType> => {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.lang = lang;
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.maxAlternatives = maxAlternatives;
      attachEventListeners(recognition);

      return recognition;
    }, [
      lang,
      continuous,
      interimResults,
      maxAlternatives,
      attachEventListeners
    ]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      const errorMsg = "음성 인식이 지원되지 않습니다.";
      setError(errorMsg);
      publishInterviewEvent("interview:voiceRecognitionError", {
        error: errorMsg
      });
      return;
    }

    clearRestartTimer();
    isStoppingRef.current = false;

    try {
      // 기존 인스턴스는 onend를 타지 않도록 리스너를 떼고 정리한다
      if (recognitionRef.current) {
        detachEventListeners(recognitionRef.current);
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }

      recognitionRef.current = createSpeechRecognition();
      recognitionRef.current.start();
    } catch {
      const errorMsg = "음성 인식을 시작할 수 없습니다.";
      setError(errorMsg);
      publishInterviewEvent("interview:voiceRecognitionError", {
        error: errorMsg
      });
    }
  }, [
    isSupported,
    createSpeechRecognition,
    detachEventListeners,
    clearRestartTimer
  ]);

  /**
   * 인식을 멈춘다. 누적된 답변은 지우지 않는다.
   * 답변을 비우는 것은 질문이 바뀔 때 `resetTranscript`로 명시적으로 한다.
   */
  const stopListening = useCallback(() => {
    isStoppingRef.current = true;
    clearRestartTimer();

    if (recognitionRef.current) {
      detachEventListeners(recognitionRef.current);
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }

    // 진행 중이던 세션 결과도 확정해서 보존한다
    if (currentRef.current.trim().length > 0) {
      committedRef.current.push(currentRef.current);
      currentRef.current = "";
    }

    if (isListeningRef.current) {
      publishInterviewEvent("interview:voiceRecognitionStopped");
    }
    setIsListening(false);
    isListeningRef.current = false;
  }, [detachEventListeners, clearRestartTimer]);

  useInterviewEvent("interview:startVoiceRecognition", startListening);
  useInterviewEvent("interview:stopVoiceRecognition", stopListening);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      const errorMsg = "이 브라우저는 음성 인식을 지원하지 않습니다.";
      setError(errorMsg);
      publishInterviewEvent("interview:voiceRecognitionError", {
        error: errorMsg
      });
      return;
    }

    setIsSupported(true);
  }, []);

  // 오래 침묵하면 이어서 말하도록 안내한다. 입력한 답변은 건드리지 않는다.
  useEffect(() => {
    if (!enabled || mode !== "VOICE") return;

    const intervalId = setInterval(() => {
      if (lastSpeechAtRef.current === 0 || silenceNotifiedRef.current) return;
      if (buildTranscript().length === 0) return;
      if (Date.now() - lastSpeechAtRef.current < VOICE_SILENCE_HINT_MS) return;

      silenceNotifiedRef.current = true;
      onSilenceHintRef.current?.();
    }, 1000);

    return () => clearInterval(intervalId);
  }, [enabled, mode, buildTranscript]);

  useEffect(() => {
    return () => {
      clearRestartTimer();
      if (recognitionRef.current) {
        detachEventListeners(recognitionRef.current);
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, [detachEventListeners, clearRestartTimer]);

  return {
    isListening,
    isSupported,
    error,
    resetTranscript,
    seedTranscript
  };
};
