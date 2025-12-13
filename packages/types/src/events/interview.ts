interface InterviewEventPayloads {
  "interview:startVoiceRecognition": undefined;
  "interview:stopVoiceRecognition": undefined;
  "interview:voiceRecognitionStarted": undefined;
  "interview:voiceRecognitionStopped": undefined;
  "interview:voiceRecognitionError": { error: string };
  "interview:voiceRecognitionResult": { text: string };
}

type InterviewEventType = keyof InterviewEventPayloads;

export type { InterviewEventType, InterviewEventPayloads };
