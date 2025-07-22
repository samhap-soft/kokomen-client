import WebView from "react-native-webview";

export default function DashboardScreen() {
  return (
    <WebView
      source={{ uri: `${process.env.EXPO_PUBLIC_CLIENT_URL}/dashboard` }}
      headers={{
        host: "local.kokomen.kr",
      }}
    />
  );
}
