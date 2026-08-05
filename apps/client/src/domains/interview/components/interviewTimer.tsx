import { JSX, useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";

interface InterviewTimerProps {
  // 카운트다운 시작 시간(초)
  durationSeconds: number;
  // 이 값이 바뀌면 타이머가 리셋됨 (질문별 리셋용)
  resetKey: number | string;
  // 타이머 동작 여부
  isActive: boolean;
  // 시간이 0이 되면 호출 (질문당 한 번)
  onTimeout: () => void;
}

const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export function InterviewTimer({
  durationSeconds,
  resetKey,
  isActive,
  onTimeout
}: InterviewTimerProps): JSX.Element {
  const [secondsLeft, setSecondsLeft] = useState<number>(durationSeconds);
  const hasTimedOutRef = useRef<boolean>(false);
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  // 질문이 바뀌면 타이머 리셋
  useEffect(() => {
    setSecondsLeft(durationSeconds);
    hasTimedOutRef.current = false;
  }, [resetKey, durationSeconds]);

  // 매초 카운트다운
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
  }, [isActive, resetKey]);

  // 시간이 다 되면 한 번만 콜백 실행
  useEffect(() => {
    if (secondsLeft === 0 && isActive && !hasTimedOutRef.current) {
      hasTimedOutRef.current = true;
      onTimeoutRef.current();
    }
  }, [secondsLeft, isActive]);

  const isLow = secondsLeft <= 10;

  return (
    <div
      role="timer"
      aria-label="남은 답변 시간"
      className={`fixed top-3 right-16 z-50 flex items-center gap-1.5 px-3 py-2 rounded-md border shadow-sm bg-bg-base tabular-nums font-bold ${
        isLow
          ? "border-error text-error animate-pulse"
          : "border-border text-text-secondary"
      }`}
    >
      <Clock className="w-4 h-4" />
      <span>{formatTime(secondsLeft)}</span>
    </div>
  );
}
