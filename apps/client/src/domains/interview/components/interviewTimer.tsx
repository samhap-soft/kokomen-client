import { JSX, useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";

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
 * 질문별 리셋은 호출부에서 `key={cur_question_id}`로 리마운트해서 처리한다.
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
  const hasTimedOutRef = useRef<boolean>(false);
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

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
  }, [isActive]);

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
      className={`fixed top-3 right-32 z-50 flex items-center gap-1.5 px-3 py-2 rounded-md border shadow-sm bg-bg-base tabular-nums font-bold ${
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
