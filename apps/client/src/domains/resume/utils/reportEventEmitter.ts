/* eslint-disable no-unused-vars */
import {
  publishEvent,
  PublishEventFunction,
  useSubscribeEvents
} from "@/utils/eventEmitter";
import { ReportEventPayloads, ReportEventType } from "@kokomen/types";
import { DependencyList } from "react";
// 이벤트에 대서 콜백 함수 구독하는 훅
export function useReportevent<K extends ReportEventType>(
  event: K,
  handler: ReportEventPayloads[K] extends undefined
    ? () => void
    : (payload: ReportEventPayloads[K]) => void,
  deps: DependencyList = []
): void {
  useSubscribeEvents<ReportEventType>([{ event, handler }], []);
}

export const publishReportEvent: PublishEventFunction<
  ReportEventType,
  ReportEventPayloads
> = publishEvent<ReportEventType, ReportEventPayloads>();
