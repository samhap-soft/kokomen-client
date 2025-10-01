type WebviewMessageType =
  | "startListening"
  | "stopListening"
  | "speechRecognitionResult"
  | "checkSpeechRecognitionSupported"
  | "appleLoginResult";

type WebviewMessage<T> = {
  type: WebviewMessageType;
  data?: T;
};

export { WebviewMessage, WebviewMessageType };
