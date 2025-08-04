import useSpeechRecognition from "@/hooks/useSpeechRecognition";
import { useRef } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  View,
} from "react-native";
import WebView, { WebViewMessageEvent } from "react-native-webview";

export default function InterviewMainScreen() {
  const webviewRef = useRef<WebView>(null);
  const runFirst = `
      window.isNativeApp = true;
      true;
    `;

  const { handleStart, handleStop } = useSpeechRecognition({
    onResult: (transcript) => {
      const speechRecognitionResult = JSON.stringify({
        type: "speechRecognitionResult",
        result: transcript,
      });
      webviewRef.current?.postMessage(speechRecognitionResult);
    },
  });
  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "startListening") {
        console.log("startListening");
        handleStart();
      } else if (data.type === "stopListening") {
        console.log("stopListening");
        handleStop();
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
            source={{ uri: `${process.env.EXPO_PUBLIC_CLIENT_URL}/interviews` }}
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
