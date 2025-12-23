/* eslint-disable no-unused-vars */
import { publishEvent, useSubscribeEvents } from "@/utils/eventEmitter";
import { InterviewEventPayloads, InterviewEventType } from "@kokomen/types";
import { DependencyList } from "react";
// 이벤트에 대서 콜백 함수 구독하는 훅
export function useInterviewEvent<K extends InterviewEventType>(
  event: K,
  handler: InterviewEventPayloads[K] extends undefined
    ? () => void
    : (payload: InterviewEventPayloads[K]) => void,
  deps: DependencyList = []
): void {
  const eventEmitter = useSubscribeEvents<InterviewEventType>(
    [{ event, handler }],
    []
  );
}

export const publishInterviewEvent = publishEvent<
  InterviewEventType,
  InterviewEventPayloads
>();
