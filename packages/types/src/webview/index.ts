type WebviewMessageType =
  | "startListening"
  | "stopListening"
  | "speechRecognitionResult";

type WebviewMessage = {
  type: WebviewMessageType;
  result?: string;
};

export { WebviewMessage, WebviewMessageType };
