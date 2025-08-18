import { InterviewMode, WebviewMessage } from "@kokomen/types";
import { useEffect, useState } from "react";

export default function useSpeechRecognition(
  // eslint-disable-next-line no-unused-vars
  callback: (result: string) => void,
  mode: InterviewMode
): {
  startListening: () => void;
  stopListening: () => void;
  isListening: boolean;
  isSupported: boolean;
} {
  const [isListening, setIsListening] = useState<boolean>(mode === "VOICE");
  const [isSupported, setIsSupported] = useState<boolean>(false);

  const startListening = (): void => {
    window.ReactNativeWebView?.postMessage(
      JSON.stringify({
        type: "startListening"
      })
    );
  };

  const stopListening = (): void => {
    window.ReactNativeWebView?.postMessage(
      JSON.stringify({
        type: "stopListening"
      })
    );
  };

  // useEffect로 이동하여 한 번만 실행되도록 수정
  useEffect(() => {
    if (typeof window !== "undefined" && window.ReactNativeWebView) {
      setIsSupported(true);
      return;
    }
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent): void => {
      const { type, data } = JSON.parse(event.data) as WebviewMessage<string>;
      switch (type) {
        case "startListening":
          setIsListening(true);
          break;
        case "stopListening":
          setIsListening(false);
          break;
        case "speechRecognitionResult":
          if (data) callback(data);
          break;
      }
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
