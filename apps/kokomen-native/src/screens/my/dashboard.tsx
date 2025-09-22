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
  const runFirst = `
      window.isNativeApp = true;
      true;
    `;

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
            userAgent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36"
            javaScriptEnabled={true}
            originWhitelist={["*"]}
            injectedJavaScriptBeforeContentLoaded={runFirst}
            webviewDebuggingEnabled
            style={{ flex: 1 }}
            pullToRefreshEnabled={true}
            setBuiltInZoomControls={false}
            domStorageEnabled={true}
            setDisplayZoomControls={false}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
