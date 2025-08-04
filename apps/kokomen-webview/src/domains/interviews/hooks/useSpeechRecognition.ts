import { WebviewMessage } from "@kokomen/types";
import { useEffect, useState } from "react";

export default function useSpeechRecognition(
  // eslint-disable-next-line no-unused-vars
  callback: (result: string) => void
): {
  startListening: () => void;
  stopListening: () => void;
  isListening: boolean;
  isSupported: boolean;
} {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(false);

  // useEffect로 이동하여 한 번만 실행되도록 수정
  useEffect(() => {
    if (typeof window !== "undefined" && window.ReactNativeWebView) {
      setIsSupported(true);
    }
  }, []); // 빈 의존성 배열로 한 번만 실행

  const startListening = (): void => {
    window.ReactNativeWebView?.postMessage(
      JSON.stringify({
        type: "startListening"
      })
    );
    setIsListening(true);
  };

  const stopListening = (): void => {
    window.ReactNativeWebView?.postMessage(
      JSON.stringify({
        type: "stopListening"
      })
    );
    setIsListening(false);
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent): void => {
      const data = JSON.parse(event.data) as WebviewMessage;
      if (data.type === "speechRecognitionResult" && data.result)
        callback(data.result);
    };
    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [callback]);

  return {
    startListening,
    stopListening,
    isListening,
    isSupported
  };
}
