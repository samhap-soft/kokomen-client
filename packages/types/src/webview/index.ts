type WebviewMessageType =
  | "startListening"
  | "stopListening"
  | "speechRecognitionResult"
  | "checkSpeechRecognitionSupported";

type WebviewMessage<T> = {
  type: WebviewMessageType;
  data?: T;
};

export { WebviewMessage, WebviewMessageType };
