/* eslint-disable no-unused-vars */
import { EventEmitter } from "events";
import { DependencyList, useEffect } from "react";

export type InterviewEventType =
  | "startVoiceRecognition"
  | "stopVoiceRecognition"
  | "voiceRecognitionStarted"
  | "voiceRecognitionStopped"
  | "voiceRecognitionError"
  | "voiceRecognitionResult";

interface InterviewEventPayloads {
  startVoiceRecognition: undefined;
  stopVoiceRecognition: undefined;
  voiceRecognitionStarted: undefined;
  voiceRecognitionStopped: undefined;
  voiceRecognitionError: { error: string };
  voiceRecognitionResult: { text: string };
}

class TypedEventEmitter extends EventEmitter {
  public emit<K extends InterviewEventType>(
    event: K,
    ...args: InterviewEventPayloads[K] extends undefined
      ? []
      : [InterviewEventPayloads[K]]
  ): boolean {
    return super.emit(event, ...args);
  }

  public on<K extends InterviewEventType>(
    event: K,
    listener: InterviewEventPayloads[K] extends undefined
      ? () => void
      : (payload: InterviewEventPayloads[K]) => void
  ): this {
    return super.on(event, listener);
  }

  public off<K extends InterviewEventType>(
    event: K,
    listener: InterviewEventPayloads[K] extends undefined
      ? () => void
      : (payload: InterviewEventPayloads[K]) => void
  ): this {
    return super.off(event, listener);
  }

  public once<K extends InterviewEventType>(
    event: K,
    listener: InterviewEventPayloads[K] extends undefined
      ? () => void
      : (payload: InterviewEventPayloads[K]) => void
  ): this {
    return super.once(event, listener);
  }
}

// 싱글톤 인스턴스
export const interviewEvents: TypedEventEmitter = new TypedEventEmitter();

// React Hook for subscribing to events
export function useInterviewEvent<K extends InterviewEventType>(
  event: K,
  handler: InterviewEventPayloads[K] extends undefined
    ? () => void
    : (payload: InterviewEventPayloads[K]) => void,
  deps: DependencyList = []
): void {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    interviewEvents.on(event, handler as any);
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      interviewEvents.off(event, handler as any);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, ...deps]);
}

// 이벤트 발행 헬퍼 함수들
export const interviewEventHelpers: {
  startVoiceRecognition: () => void;
  stopVoiceRecognition: () => void;
  notifyVoiceStarted: () => void;
  notifyVoiceStopped: () => void;
  notifyVoiceError: (error: string) => void;
  sendVoiceResult: (text: string) => void;
} = {
  startVoiceRecognition: (): void => {
    interviewEvents.emit("startVoiceRecognition");
  },
  stopVoiceRecognition: (): void => {
    interviewEvents.emit("stopVoiceRecognition");
  },

  notifyVoiceStarted: (): void => {
    interviewEvents.emit("voiceRecognitionStarted");
  },

  notifyVoiceStopped: (): void => {
    interviewEvents.emit("voiceRecognitionStopped");
  },

  notifyVoiceError: (error: string): void => {
    interviewEvents.emit("voiceRecognitionError", { error });
  },

  sendVoiceResult: (text: string): void => {
    interviewEvents.emit("voiceRecognitionResult", { text });
  }
};
