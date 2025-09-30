import { useRef } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  View,
} from "react-native";
import WebView from "react-native-webview";
import useWebviewEvents from "@/hooks/useWebviewEvents";
import { WEBVIEW_RUN_FIRST_SCRIPT } from "@/constants";

export default function InterviewMainScreen() {
  const webviewRef = useRef<WebView>(null);

  const { handleMessage } = useWebviewEvents(webviewRef);

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
            injectedJavaScriptBeforeContentLoaded={WEBVIEW_RUN_FIRST_SCRIPT}
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
