import { useCallback, useEffect, useRef, useState } from "react";

interface UseSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  error: string | null;
}

type SpeechRecognitionType =
  | typeof window.SpeechRecognition
  | typeof window.webkitSpeechRecognition;

interface UseSpeechRecognitionProps {
  // eslint-disable-next-line no-unused-vars
  onSpeechEnd: (result: string) => void;
  startOnMount: boolean;
  enabled?: boolean;
  options?: UseSpeechRecognitionOptions;
}

export const useSpeechRecognition = ({
  onSpeechEnd,
  startOnMount = false,
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
  }, []);

  const handleSpeechEnd = useCallback((): void => {
    setIsListening(false);
    if (result.current[resultPointer.current] === "") {
      return;
    }
    resultPointer.current++;
    if (startOnMount) {
      recognitionRef.current?.start();
    }
  }, [startOnMount]);

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
      onSpeechEnd(result.current.join(" "));
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
          errorMessage = "음성이 감지되지 않았습니다.";
          break;
        case "audio-capture":
          errorMessage = "마이크에 접근할 수 없습니다.";
          break;
        case "not-allowed":
          errorMessage = "마이크 권한이 필요합니다.";
          break;
        case "network":
          errorMessage = "네트워크 오류가 발생했습니다.";
          break;
        default:
          errorMessage = `음성 인식 오류: ${event.error}`;
      }

      setError(errorMessage);
    },
    []
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
      setError("음성 인식이 지원되지 않습니다.");
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
      setError("음성 인식을 시작할 수 없습니다.");
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

  // 컴포넌트 마운트 시 브라우저 지원 확인
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError("이 브라우저는 음성 인식을 지원하지 않습니다.");
      return;
    }

    setIsSupported(true);
  }, [startListening]);

  useEffect(() => {
    if (startOnMount) {
      startListening();
    }
  }, [startOnMount, startListening]);

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
    startListening,
    stopListening,
    error
  };
};
