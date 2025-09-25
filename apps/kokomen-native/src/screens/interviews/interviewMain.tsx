import { useRef } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  View,
} from "react-native";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import useSpeechRecognition from "@/hooks/useSpeechRecognition";
import { ExpoSpeechRecognitionModule } from "expo-speech-recognition";

export default function InterviewMainScreen() {
  const webviewRef = useRef<WebView>(null);
  const runFirst = `
      window.isNativeApp = true;
      true;
    `;

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
      }
    } catch (error) {
      console.error("error while parsing message", error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "position", android: undefined })}
          enabled
          keyboardVerticalOffset={-300}
          contentContainerStyle={{ flex: 1 }}
          style={{ flex: 1 }}
        >
          <WebView
            ref={webviewRef as any}
            pullToRefreshEnabled={true}
            source={{
              uri: `${process.env.EXPO_PUBLIC_CLIENT_URL}/interviews`,
            }}
            userAgent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36"
            javaScriptEnabled={true}
            originWhitelist={["*"]}
            injectedJavaScriptBeforeContentLoaded={runFirst}
            webviewDebuggingEnabled
            onMessage={handleMessage}
            style={{ flex: 1 }}
            setBuiltInZoomControls={false}
            domStorageEnabled={true}
            setDisplayZoomControls={false}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
