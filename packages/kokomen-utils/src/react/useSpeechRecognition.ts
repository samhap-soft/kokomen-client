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
}
export const useSpeechRecognition = ({
  onSpeechEnd,
  options = {}
}: UseSpeechRecognitionProps): UseSpeechRecognitionReturn => {
  const {
    lang = "ko-KR",
    continuous = true,
    interimResults = false,
    maxAlternatives = 1
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<InstanceType<SpeechRecognitionType> | null>(
    null
  );

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

    // SpeechRecognition 인스턴스 생성
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    // 설정
    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.maxAlternatives = maxAlternatives;

    // 이벤트 핸들러
    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      onSpeechEnd(finalTranscript + interimTranscript);
    };

    recognition.onerror = (event) => {
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
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return () => {
      if (recognition) {
        recognition.abort();
      }
    };
  }, [lang, continuous, interimResults, maxAlternatives, onSpeechEnd]);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      setError("음성 인식이 지원되지 않습니다.");
      return;
    }

    try {
      recognitionRef.current?.start();
    } catch (error) {
      setError("음성 인식을 시작할 수 없습니다.");
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current?.stop();
    }
  }, [isListening]);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
    error
  };
};
