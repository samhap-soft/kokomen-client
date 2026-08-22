import { publishEvent, useSubscribeEvents } from "@/utils/eventEmitter";
import { InterviewEventPayloads, InterviewEventType } from "@kokomen/types";
import { useEffect, useMemo, useRef } from "react";

/**
 * 면접 이벤트를 구독하는 훅.
 *
 * 핸들러를 ref에 담아 전달하기 때문에 구독은 이벤트 이름당 한 번만 일어나고,
 * 발행 시점에는 항상 최신 핸들러가 호출된다. 예전 구현은 `[{ event, handler }]`
 * 배열 리터럴을 그대로 effect 의존성으로 넘겨서 렌더마다 구독/해제를 반복했다.
 */
export function useInterviewEvent<K extends InterviewEventType>(
  event: K,
  // eslint-disable-next-line no-unused-vars
  handler: (payload: InterviewEventPayloads[K]) => void
): void {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  const events = useMemo(
    () => [
      {
        event,
        handler: ((payload: InterviewEventPayloads[K]) =>
          handlerRef.current(payload)) as (
          // eslint-disable-next-line no-unused-vars
          payload: InterviewEventPayloads[InterviewEventType]
        ) => void
      }
    ],
    [event]
  );

  useSubscribeEvents<InterviewEventType>(
    events as Parameters<typeof useSubscribeEvents<InterviewEventType>>[0]
  );
}

export const publishInterviewEvent = publishEvent<
  InterviewEventType,
  InterviewEventPayloads
>();
