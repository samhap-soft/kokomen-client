/* eslint-disable no-unused-vars */
import { publishEvent, useSubscribeEvents } from "@/utils/eventEmitter";
import {
  ResumeAnalysisEventPayloads,
  ResumeAnalysisEventType
} from "@kokomen/types";
import { DependencyList } from "react";

// 이력서 분석 이벤트에 콜백 함수를 구독하는 훅
export function useResumeAnalysisEvent<K extends ResumeAnalysisEventType>(
  event: K,
  handler: ResumeAnalysisEventPayloads[K] extends undefined
    ? () => void
    : (payload: ResumeAnalysisEventPayloads[K]) => void,
  deps: DependencyList = []
): void {
  useSubscribeEvents<ResumeAnalysisEventType>([{ event, handler }], []);
}

export const publishResumeAnalysisEvent: <K extends ResumeAnalysisEventType>(
  event: K,
  ...args: ResumeAnalysisEventPayloads[K] extends undefined
    ? []
    : [ResumeAnalysisEventPayloads[K]]
) => boolean = publishEvent<
  ResumeAnalysisEventType,
  ResumeAnalysisEventPayloads
>();
