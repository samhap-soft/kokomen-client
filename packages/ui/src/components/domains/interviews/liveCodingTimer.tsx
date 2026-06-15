import { useState, useEffect, useCallback, useRef } from "react";
import { Clock } from "lucide-react";
import { cn } from "../../../utils";

interface LiveCodingTimerProps {
  totalSeconds: number;
  isRunning: boolean;
  onTimeUp?: () => void;
  className?: string;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function LiveCodingTimer({
  totalSeconds,
  isRunning,
  onTimeUp,
  className,
}: LiveCodingTimerProps) {
  const [elapsed, setElapsed] = useState(0);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        if (next >= totalSeconds) {
          clearInterval(interval);
          onTimeUpRef.current?.();
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, totalSeconds]);

  const remaining = Math.max(totalSeconds - elapsed, 0);
  const isWarning = remaining <= 120 && remaining > 30;
  const isCritical = remaining <= 30;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-sm",
        !isWarning && !isCritical && "text-text-primary bg-bg-elevated",
        isWarning && "text-warning bg-warning-bg animate-pulse",
        isCritical && "text-error bg-error-bg animate-pulse",
        className
      )}
    >
      <Clock size={16} />
      <span>{formatTime(elapsed)}</span>
      <span className="text-text-tertiary">/</span>
      <span>{formatTime(remaining)}</span>
    </div>
  );
}
