import { JSX } from "react";
import { cn } from "../../../../utils";

/** Figma "음량 반응 · 예시"(1172:2502) 의 막대 높이(px) */
const BAR_HEIGHTS: readonly number[] = [
  4, 8, 13, 7, 17, 11, 20, 8, 15, 10, 6, 13, 8, 4
];

export interface RecordingIndicatorProps {
  /** 녹음 중이면 막대가 움직인다 */
  isRecording: boolean;
  label?: string;
  className?: string;
}

/**
 * Figma: "녹음 상태와 음량"(1172:2501)
 *
 * 실제 음량을 재지 않고 녹음 중이라는 사실만 보여준다.
 * 움직임을 줄이도록 설정한 사용자에게는 막대를 멈춘다.
 */
export function RecordingIndicator({
  isRecording,
  label,
  className
}: RecordingIndicatorProps): JSX.Element {
  const text = label ?? (isRecording ? "녹음 중" : "대기 중");
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex h-10 items-center gap-2.5", className)}
    >
      <div className="flex h-5 items-center gap-[3px]" aria-hidden="true">
        {BAR_HEIGHTS.map((height, index) => (
          <span
            key={index}
            className={cn(
              "w-[3.5px] rounded-full",
              isRecording
                ? "bg-primary motion-safe:animate-pulse"
                : "bg-fill"
            )}
            style={{
              height: isRecording ? height : 4,
              animationDelay: `${(index % 5) * 120}ms`
            }}
          />
        ))}
      </div>
      <span className="text-base font-semibold text-text-primary">{text}</span>
    </div>
  );
}
