import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useState } from "react";
import { Platform } from "react-native";

export default function useSpeechRecognition({
  onStart,
  onEnd,
  onResult,
  onError,
  abortOnError = false,
}: {
  onStart?: () => void;
  onEnd?: () => void;
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  abortOnError?: boolean;
}) {
  const [isListening, setIsListening] = useState(false);

  useSpeechRecognitionEvent("start", () => {
    setIsListening(true);
    onStart?.();
  });
  useSpeechRecognitionEvent("end", () => {
    setIsListening(false);
    onEnd?.();
  });

  useSpeechRecognitionEvent("result", (event) => {
    onResult?.(event.results[0]?.transcript);
  });
  useSpeechRecognitionEvent("error", (event) => {
    onError?.(event.error);
    if (abortOnError) {
      ExpoSpeechRecognitionModule.abort();
    }
  });

  const handleStart = async () => {
    const microphonePermissions =
      await ExpoSpeechRecognitionModule.requestMicrophonePermissionsAsync();
    if (!microphonePermissions.granted) {
      alert("마이크 허용을 해야 인터뷰 내 마이크 인식이 가능합니다.");
      return;
    }

    if (Platform.OS === "ios") {
      const speechRecognizerPermissions =
        await ExpoSpeechRecognitionModule.requestSpeechRecognizerPermissionsAsync();
      if (!speechRecognizerPermissions.granted) {
        if (speechRecognizerPermissions.restricted) {
          alert("음성 인식 권한이 제한되었습니다.");
        } else {
          alert("음성 인식 권한이 없습니다.");
        }
        return;
      }
    }
    // Start speech recognition
    ExpoSpeechRecognitionModule.start({
      lang: "ko-KR",
      interimResults: true,
      continuous: true,
      requiresOnDeviceRecognition: Platform.OS === "ios",
    });
  };

  const handleStop = async () => {
    setIsListening(false);
    ExpoSpeechRecognitionModule.stop();
  };

  return {
    handleStart,
    handleStop,
    isListening,
  };
}
