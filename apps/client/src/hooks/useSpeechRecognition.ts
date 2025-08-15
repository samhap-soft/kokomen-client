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
  options?: UseSpeechRecognitionOptions;
  startOnMount?: boolean;
}
export const useSpeechRecognition = ({
  onSpeechEnd,
  startOnMount = false,
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

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    }
    result.current = [];
    resultPointer.current = 0;
  }, [isListening]);

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
      let resultString = "";
      for (const result of event.results) {
        if (result[0].transcript) {
          resultString += result[0].transcript;
        }
      }
      result.current[resultPointer.current] = resultString;
      onSpeechEnd(result.current.join(" "));
    },
    [onSpeechEnd]
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

  const createSpeechRecognition =
    useCallback((): InstanceType<SpeechRecognitionType> => {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = lang;
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.maxAlternatives = maxAlternatives;
      recognition.lang = lang;
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.maxAlternatives = maxAlternatives;

      // 이벤트 핸들러
      recognition.onstart = handleSpeechStart;

      recognition.onresult = (event) => {
        handleSpeechResult(event);
      };

      recognition.onerror = (event) => {
        handleSpeechError(event);
      };

      recognition.onend = handleSpeechEnd;

      return recognition;
    }, [
      lang,
      continuous,
      interimResults,
      maxAlternatives,
      handleSpeechStart,
      handleSpeechResult,
      handleSpeechError,
      handleSpeechEnd
    ]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError("음성 인식이 지원되지 않습니다.");
      return;
    }

    try {
      recognitionRef.current = createSpeechRecognition();
      recognitionRef.current?.start();
    } catch (error) {
      setError("음성 인식을 시작할 수 없습니다.");
    }
  }, [isSupported, createSpeechRecognition]);

  useEffect(() => {
    // 브라우저 지원 확인
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError("이 브라우저는 음성 인식을 지원하지 않습니다.");
      return;
    }

    setIsSupported(true);
    if (startOnMount) {
      startListening();
    }
  }, [startOnMount, createSpeechRecognition]);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
    error
  };
};
