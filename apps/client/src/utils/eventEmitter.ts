import EventEmitter from "events";
import { useEffect } from "react";

type EventType = string;
interface EventPayloads {
  [key: EventType]: any;
}
class TypedEventEmitter extends EventEmitter {
  public emit<K extends EventType>(
    event: K,
    ...args: EventPayloads[K] extends undefined ? [] : [EventPayloads[K]]
  ): boolean {
    return super.emit(event, ...args);
  }

  public on<K extends EventType>(
    event: K,
    listener: EventPayloads[K] extends undefined
      ? () => void
      : // eslint-disable-next-line no-unused-vars
        (payload: EventPayloads[K]) => void
  ): this {
    return super.on(event, listener);
  }

  public off<K extends EventType>(
    event: K,
    listener: EventPayloads[K] extends undefined
      ? () => void
      : // eslint-disable-next-line no-unused-vars
        (payload: EventPayloads[K]) => void
  ): this {
    return super.off(event, listener);
  }

  public once<K extends EventType>(
    event: K,
    listener: EventPayloads[K] extends undefined
      ? () => void
      : // eslint-disable-next-line no-unused-vars
        (payload: EventPayloads[K]) => void
  ): this {
    return super.once(event, listener);
  }
}

// 중앙화된 싱글톤 인스턴스
export const GlobalEventBus = new TypedEventEmitter();

// useEventEmitter.ts

// 이벤트 핸들러의 타입을 명확하게 제네릭으로 정의
type EventHandler<K extends EventType> = EventPayloads[K] extends undefined
  ? () => void
  : // eslint-disable-next-line no-unused-vars
    (payload: EventPayloads[K]) => void;

type EventEmitterContext<K extends EventType> = {
  event: K;
  handler: EventHandler<K>;
};

// 훅의 인수를 보다 타입 안전하게 정의
// T는 EventEmitterContext의 배열이 되도록 제한
// 이벤트 구독의 경우 컴포넌트가 마운트되었을 시기에 구독한 후 언마운트 시 이에 대해 해제해야 하므로 훅으로 개발
export function useSubscribeEvents<K extends EventType>(
  events: EventEmitterContext<K>[],
  deps: any[] = []
): void {
  useEffect(() => {
    events.forEach(({ event, handler }) => {
      // 1. 싱글톤을 사용
      // 2. on 메서드의 타입 추론 덕분에 handler 인수의 타입이 자동으로 유추됩니다.
      GlobalEventBus.on(event, handler as EventHandler<EventType>);
    });
    return () => {
      events.forEach(({ event, handler }) => {
        GlobalEventBus.off(event, handler as EventHandler<EventType>);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, ...deps]);
}

//  제네릭을 받는 PublishEventFunctio
type PublishEventFunction<
  TEvent extends string, // TEvent는 문자열 리터럴 타입의 유니온이어야 함
  TPayloads extends Record<TEvent, unknown> // TPayloads는 TEvent의 각 항목을 키로 가져야 함
> = <K extends TEvent>(
  // 제네릭 K는 TEvent의 하위 타입

  // eslint-disable-next-line no-unused-vars
  event: K,
  // TPayloads[K]를 사용하여 조건부 타입 적용
  // eslint-disable-next-line no-unused-vars
  ...args: TPayloads[K] extends undefined ? [] : [TPayloads[K]]
) => boolean;

export function publishEvent<
  TEvent extends string,
  TPayloads extends Record<TEvent, unknown>
>(): PublishEventFunction<TEvent, TPayloads> {
  return <K extends TEvent>(
    event: K,
    ...args: TPayloads[K] extends undefined ? [] : [TPayloads[K]]
  ) => GlobalEventBus.emit(event, ...args);
}
