import { Ref, RefObject, useCallback } from "react";

type CallbackRef<T> = (instance: T | null) => void;

export function useCombinedRefs<T>(
  ...refs: Array<Ref<T> | CallbackRef<T>>
): Ref<T> {
  return useCallback((value: T) => {
    for (const ref of refs) {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref !== null) {
        (ref as RefObject<T>).current = value;
      }
    }
  }, refs);
}
