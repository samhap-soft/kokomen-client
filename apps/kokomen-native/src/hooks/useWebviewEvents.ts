import useSpeechRecognition from "@/hooks/useSpeechRecognition";
import appleAuth from "@invertase/react-native-apple-authentication";
import axios from "axios";
import { ExpoSpeechRecognitionModule } from "expo-speech-recognition";
import WebView, { WebViewMessageEvent } from "react-native-webview";

export default function useWebviewEvents(
  webviewRef: React.RefObject<WebView | null>,
) {
  const { handleStart, handleStop, isListening } = useSpeechRecognition({
    onResult: (transcript) => {
      const speechRecognitionResult = JSON.stringify({
        type: "speechRecognitionResult",
        data: transcript,
      });
      webviewRef.current?.postMessage(speechRecognitionResult);
    },
    onStart: () => {
      webviewRef.current?.postMessage(
        JSON.stringify({
          type: "startListening",
        }),
      );
    },
    onEnd: () => {
      webviewRef.current?.postMessage(
        JSON.stringify({
          type: "stopListening",
        }),
      );
    },
  });

  const checkSpeechRecognitionSupported = () => {
    ExpoSpeechRecognitionModule.requestPermissionsAsync()
      .then((result) => {
        if (result.status === "granted") {
          webviewRef.current?.postMessage(
            JSON.stringify({
              type: "checkSpeechRecognitionSupported",
              data: true,
            }),
          );
        } else {
          webviewRef.current?.postMessage(
            JSON.stringify({
              type: "checkSpeechRecognitionSupported",
              data: false,
            }),
          );
        }
      })
      .catch(() => {
        webviewRef.current?.postMessage(
          JSON.stringify({
            type: "checkSpeechRecognitionSupported",
            data: false,
          }),
        );
      });
  };

  const pageChange = () => {
    if (isListening) {
      handleStop();
    }
  };

  const appleLogin = async () => {
    try {
      const appleAuthResult = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });

      webviewRef.current?.postMessage(
        JSON.stringify({
          type: "appleLoginResult",
          data: {
            authorizationCode: appleAuthResult.authorizationCode,
            identityToken: appleAuthResult.identityToken,
            user: appleAuthResult.user,
            realUserStatus: appleAuthResult.realUserStatus,
            fullName: appleAuthResult.fullName,
            nonce: appleAuthResult.nonce,
            state: appleAuthResult.state,
          },
        }),
      );
    } catch (error) {
      console.error("error while apple login", error);
    }
  };

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      switch (data.type) {
        case "startListening":
          handleStart();
          break;
        case "stopListening":
          handleStop();
          break;
        case "checkSpeechRecognitionSupported":
          checkSpeechRecognitionSupported();
          break;
        case "pageChange":
          pageChange();
          break;
        case "appleLogin":
          appleLogin();
          break;
      }
    } catch (error) {
      console.error("error while parsing message", error);
    }
  };
  return {
    handleMessage,
  };
}
