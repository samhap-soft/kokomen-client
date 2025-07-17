import { WebView } from "react-native-webview";
import { StyleSheet, Text, View } from "react-native";

export default function App() {
  return <WebView source={{ uri: "https://kokomen.kr" }} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
