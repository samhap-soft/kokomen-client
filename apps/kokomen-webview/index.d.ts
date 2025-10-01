/// <reference types="vite/client" />

declare global {
  interface Window {
    isNativeApp?: boolean;
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
    OS?: "ios" | "android";
  }
}

export {};
