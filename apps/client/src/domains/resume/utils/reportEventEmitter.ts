/* eslint-disable no-unused-vars */
import { publishEvent, useSubscribeEvents } from "@/utils/eventEmitter";
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
  const eventEmitter = useSubscribeEvents<ReportEventType>(
    [{ event, handler }],
    []
  );
}

export const publishReportEvent = publishEvent<
  ReportEventType,
  ReportEventPayloads
>();
