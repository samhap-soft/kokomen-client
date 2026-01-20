/* eslint-disable no-unused-vars */
import { publishEvent, useSubscribeEvents } from "@/utils/eventEmitter";
import {
  ResumeBasedInterviewEventPayloads,
  ResumeBasedInterviewEventType
} from "@kokomen/types";
import { DependencyList } from "react";
// 이벤트에 대서 콜백 함수 구독하는 훅
export function useResumeBasedInterviewEvent<
  K extends ResumeBasedInterviewEventType
>(
  event: K,
  handler: ResumeBasedInterviewEventPayloads[K] extends undefined
    ? () => void
    : (payload: ResumeBasedInterviewEventPayloads[K]) => void,
  deps: DependencyList = []
): void {
  const eventEmitter = useSubscribeEvents<ResumeBasedInterviewEventType>(
    [{ event, handler }],
    []
  );
}

export const publishResumeBasedInterviewEvent = publishEvent<
  ResumeBasedInterviewEventType,
  ResumeBasedInterviewEventPayloads
>();
