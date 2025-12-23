import { publishEvent, useSubscribeEvents } from "@/utils/events";
import { InterviewEventType, InterviewEventPayloads } from "@kokomen/types";
import { DependencyList } from "react";

export function useInterviewEvent<K extends InterviewEventType>(
  event: K,
  handler: InterviewEventPayloads[K] extends undefined
    ? () => void
    : // eslint-disable-next-line no-unused-vars
      (payload: InterviewEventPayloads[K]) => void,
  // eslint-disable-next-line no-unused-vars
  deps: DependencyList = []
): void {
  useSubscribeEvents<InterviewEventType>([{ event, handler }], []);
}

export const publishInterviewEvent = publishEvent<
  InterviewEventType,
  InterviewEventPayloads
>();
