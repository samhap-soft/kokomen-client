import { WEBVIEW_RUN_FIRST_SCRIPT } from "@/constants";
import useUserAgent from "@/hooks/useUserAgent";
import useWebviewEvents from "@/hooks/useWebviewEvents";
import { useRef } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  View,
} from "react-native";
import WebView from "react-native-webview";

export default function DashboardScreen() {
  const webviewRef = useRef<WebView>(null);
  const { handleMessage } = useWebviewEvents(webviewRef);
  const userAgent = useUserAgent();
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
            source={{ uri: `${process.env.EXPO_PUBLIC_CLIENT_URL}/dashboard` }}
            userAgent={userAgent}
            javaScriptEnabled={true}
            originWhitelist={["*"]}
            injectedJavaScriptBeforeContentLoaded={WEBVIEW_RUN_FIRST_SCRIPT}
            webviewDebuggingEnabled
            style={{ flex: 1 }}
            pullToRefreshEnabled={true}
            setBuiltInZoomControls={false}
            domStorageEnabled={true}
            setDisplayZoomControls={false}
            onMessage={handleMessage}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
