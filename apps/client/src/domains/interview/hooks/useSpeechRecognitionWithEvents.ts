import { useCallback, useEffect, useRef, useState } from "react";
import {
  useInterviewEvent,
  interviewEventHelpers
} from "@/domains/interview/utils/interviewEventEmitter";
import { InterviewMode } from "@kokomen/types";

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
}

type SpeechRecognitionType =
  | typeof window.SpeechRecognition
  | typeof window.webkitSpeechRecognition;

interface UseSpeechRecognitionProps {
  // eslint-disable-next-line no-unused-vars
  onSpeechEnd: (result: string) => void;
  enabled?: boolean;
  options?: UseSpeechRecognitionOptions;
  mode: InterviewMode;
}

export const useSpeechRecognitionWithEvents = ({
  onSpeechEnd,
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
  const result = useRef<string[]>([]);
  const resultPointer = useRef<number>(0);

  const recognitionRef = useRef<InstanceType<SpeechRecognitionType> | null>(
    null
  );

  // 이벤트 핸들러들
  const handleSpeechStart = useCallback((): void => {
    setIsListening(true);
    setError(null);
    interviewEventHelpers.notifyVoiceStarted();
  }, []);

  const handleSpeechEnd = useCallback((): void => {
    setIsListening(false);
    interviewEventHelpers.notifyVoiceStopped();

    if (result.current[resultPointer.current] === "") {
      return;
    }
    if (mode === "VOICE") {
      interviewEventHelpers.stopVoiceRecognition();
      setTimeout(() => {
        interviewEventHelpers.startVoiceRecognition();
      }, 500);
    }
    resultPointer.current++;
  }, []);

  const handleSpeechResult = useCallback(
    // eslint-disable-next-line no-undef
    (event: SpeechRecognitionEvent): void => {
      if (!enabled) return;
      let resultString = "";
      for (const result of event.results) {
        if (result[0].transcript) {
          resultString += result[0].transcript;
        }
      }
      result.current[resultPointer.current] = resultString;
      const fullResult = result.current.join(" ");
      onSpeechEnd(fullResult);
      interviewEventHelpers.sendVoiceResult(fullResult);
    },
    [onSpeechEnd, enabled]
  );

  // eslint-disable-next-line no-undef
  const handleSpeechError = useCallback(
    // eslint-disable-next-line no-undef
    (event: SpeechRecognitionErrorEvent): void => {
      setIsListening(false);

      let errorMessage = "음성 인식 중 오류가 발생했습니다.";

      switch (event.error) {
        case "no-speech":
          errorMessage = "면접자님의 말씀이 들리지 않아요!";
          break;
        case "audio-capture":
          errorMessage = "마이크 접근 권한이 필요합니다.";
          break;
        case "not-allowed":
          errorMessage = "마이크 접근 권한이 필요합니다.";
          break;
        case "network":
          errorMessage = "네트워크 연결 상태가 좋지 않아요.";
          break;
        case "aborted":
          return;
        default:
          errorMessage = `음성 인식 중 오류가 발생했어요.`;
      }
      setError(errorMessage);

      interviewEventHelpers.notifyVoiceError(errorMessage);
      if (mode === "VOICE") {
        interviewEventHelpers.stopVoiceRecognition();
        setTimeout(() => {
          interviewEventHelpers.startVoiceRecognition();
        }, 2000);
      }
      setTimeout(() => {
        setError("");
      }, 2000);
    },
    [mode]
  );

  // 이벤트 리스너 등록 함수
  const attachEventListeners = useCallback(
    (recognition: InstanceType<SpeechRecognitionType>): void => {
      recognition.onstart = handleSpeechStart;
      recognition.onresult = handleSpeechResult;
      recognition.onerror = handleSpeechError;
      recognition.onend = handleSpeechEnd;
    },
    [handleSpeechStart, handleSpeechResult, handleSpeechError, handleSpeechEnd]
  );

  // 이벤트 리스너 해제 함수
  const detachEventListeners = useCallback(
    (recognition: InstanceType<SpeechRecognitionType>): void => {
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
    },
    []
  );

  // SpeechRecognition 인스턴스 생성 및 설정
  const createSpeechRecognition =
    useCallback((): InstanceType<SpeechRecognitionType> => {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      // 설정 적용
      recognition.lang = lang;
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.maxAlternatives = maxAlternatives;

      // 이벤트 리스너 등록
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
      interviewEventHelpers.notifyVoiceError(errorMsg);
      return;
    }

    try {
      // 기존 인스턴스가 있다면 정리
      if (recognitionRef.current) {
        detachEventListeners(recognitionRef.current);
        recognitionRef.current.abort();
      }

      // 새 인스턴스 생성 및 시작
      recognitionRef.current = createSpeechRecognition();
      recognitionRef.current.start();
    } catch (error) {
      const errorMsg = "음성 인식을 시작할 수 없습니다.";
      setError(errorMsg);
      interviewEventHelpers.notifyVoiceError(errorMsg);
    }
  }, [isSupported, createSpeechRecognition, detachEventListeners]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      // 이벤트 리스너 해제
      detachEventListeners(recognitionRef.current);

      // 음성 인식 중단
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }

    // 상태 초기화
    setIsListening(false);
    result.current = [];
    resultPointer.current = 0;
  }, [isListening, detachEventListeners]);

  // 이벤트 구독 - 음성 인식 시작 요청
  useInterviewEvent(
    "startVoiceRecognition",
    () => {
      startListening();
    },
    [startListening]
  );

  // 이벤트 구독 - 음성 인식 중지 요청
  useInterviewEvent(
    "stopVoiceRecognition",
    () => {
      stopListening();
    },
    [stopListening]
  );

  // 컴포넌트 마운트 시 브라우저 지원 확인
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      const errorMsg = "이 브라우저는 음성 인식을 지원하지 않습니다.";
      setError(errorMsg);
      interviewEventHelpers.notifyVoiceError(errorMsg);
      return;
    }

    setIsSupported(true);
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        detachEventListeners(recognitionRef.current);
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, [detachEventListeners]);

  return {
    isListening,
    isSupported,
    error
  };
};
