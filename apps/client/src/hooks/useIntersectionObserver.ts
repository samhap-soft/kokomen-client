import { RefObject, useEffect, useRef } from "react";

export const useIntersectionObserver = (
  targetRef: RefObject<HTMLDivElement | null>,
  callback: () => void,
  options: IntersectionObserverInit = {}
) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callbackRef.current();
          }
        });
      },
      {
        rootMargin: "100px", // 100px 전에 미리 로드
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [targetRef, options]);
};
