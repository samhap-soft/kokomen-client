import { JSX, useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";
import {
  TIMER_ANNOUNCE_THRESHOLDS,
  TIMER_LOW_THRESHOLD_SECONDS
} from "@/domains/interview/constants";

interface InterviewTimerProps {
  // 카운트다운 시작 시간(초)
  durationSeconds: number;
  // 타이머 동작 여부
  isActive: boolean;
  // 시간이 0이 되면 호출 (마운트당 한 번)
  onTimeout: () => void;
}

const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

/**
 * 질문별 리셋은 호출부에서 `key`로 리마운트해서 처리한다.
 * 제출이 실패해 같은 질문을 다시 답해야 할 때도 key가 바뀌어야 타이머가 되살아난다.
 *
 * 리셋을 내부 useEffect로 하면 안 된다. 리셋 effect가 도는 커밋에서는
 * setSecondsLeft(durationSeconds)가 아직 반영되지 않아 secondsLeft가 0으로 남아 있는데,
 * 같은 커밋의 타임아웃 effect는 리셋된 ref(hasTimedOut=false)를 보게 되어
 * 다음 질문에서 곧바로 onTimeout이 다시 실행된다.
 */
export function InterviewTimer({
  durationSeconds,
  isActive,
  onTimeout
}: InterviewTimerProps): JSX.Element {
  const [secondsLeft, setSecondsLeft] = useState<number>(durationSeconds);
  const [announcement, setAnnouncement] = useState<string>("");
  const hasTimedOutRef = useRef<boolean>(false);
  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  // 매초 카운트다운. isActive가 false인 동안(면접관이 말하는 중, 제출 중)에는 멈춘다.
  useEffect(() => {
    if (!isActive) return;
    const intervalId = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isActive]);

  // 시간이 다 되면 한 번만 콜백 실행
  useEffect(() => {
    if (secondsLeft === 0 && isActive && !hasTimedOutRef.current) {
      hasTimedOutRef.current = true;
      onTimeoutRef.current();
    }
  }, [secondsLeft, isActive]);

  /**
   * 남은 시간을 매초 읽어주면 방해가 되므로 임계점에서만 알린다.
   * 시각 표시는 aria-hidden으로 두고 이 live region만 읽히게 한다.
   */
  useEffect(() => {
    if (!isActive) return;
    if (!TIMER_ANNOUNCE_THRESHOLDS.includes(secondsLeft)) return;
    setAnnouncement(`답변 시간이 ${secondsLeft}초 남았습니다.`);
  }, [secondsLeft, isActive]);

  const isLow = secondsLeft <= TIMER_LOW_THRESHOLD_SECONDS;

  return (
    <>
      <div
        role="timer"
        aria-label="남은 답변 시간"
        className={`fixed top-2 right-1/2 translate-x-1/2 sm:right-32 sm:translate-x-0 z-50 flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-md border shadow-sm bg-bg-base tabular-nums font-bold text-sm sm:text-base ${
          isLow
            ? "border-error text-error motion-safe:animate-pulse"
            : "border-border text-text-secondary"
        }`}
      >
        <Clock className="w-4 h-4" aria-hidden="true" />
        <span>{formatTime(secondsLeft)}</span>
      </div>
      <span aria-live="polite" role="status" className="sr-only">
        {announcement}
      </span>
    </>
  );
}
