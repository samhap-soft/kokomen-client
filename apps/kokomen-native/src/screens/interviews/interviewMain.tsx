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
import useUserAgent from "@/hooks/useUserAgent";

export default function InterviewMainScreen() {
  const webviewRef = useRef<WebView>(null);
  const userAgent = useUserAgent();
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
            userAgent={userAgent}
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
