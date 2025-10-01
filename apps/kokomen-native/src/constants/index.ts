import { Platform } from "react-native";

const WEBVIEW_RUN_FIRST_SCRIPT = `
  window.isNativeApp = true;
  window.OS="${Platform.OS}";
  true;
`;

export { WEBVIEW_RUN_FIRST_SCRIPT };
