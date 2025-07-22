import { KeyboardAvoidingView, Platform } from "react-native";
import WebView from "react-native-webview";

export default function InterviewMainScreen() {
  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "position", android: undefined })}
      enabled
      keyboardVerticalOffset={-300}
      contentContainerStyle={{ flex: 1 }}
      style={{ flex: 1 }}
    >
      <WebView
        source={{ uri: `${process.env.EXPO_PUBLIC_CLIENT_URL}/interviews` }}
        headers={{
          host: "local.kokomen.kr",
        }}
        webviewDebuggingEnabled
        style={{ flex: 1 }}
        setBuiltInZoomControls={false}
        setDisplayZoomControls={false}
      />
    </KeyboardAvoidingView>
  );
}
