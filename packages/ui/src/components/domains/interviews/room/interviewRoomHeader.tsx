import { JSX } from "react";
import { cn } from "../../../../utils";

export interface InterviewRoomHeaderProps {
  /** 예: "프론트엔드 모의면접" */
  title: string;
  /** 예: "텍스트 면접" */
  subtitle: string;
  /** 지금 답하고 있는 질문 번호(1부터) */
  current: number;
  total: number;
  className?: string;
}

/**
 * Figma: 인터뷰 / to-be 의 세션 헤더 (1172:2427)
 *
 * 왼쪽에 면접 제목과 방식, 오른쪽에 "질문 n / N" 과 진행 막대를 둔다.
 * 좁은 화면에서는 진행 막대가 제목 아래 한 줄을 차지한다.
 */
export function InterviewRoomHeader({
  title,
  subtitle,
  current,
  total,
  className
}: InterviewRoomHeaderProps): JSX.Element {
  const safeTotal = Math.max(total, 1);
  const percent = Math.min(Math.max(current / safeTotal, 0), 1) * 100;

  return (
    <header
      className={cn(
        "flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-6",
        className
      )}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="truncate text-xl font-bold text-text-primary md:text-2xl">
          {title}
        </h1>
        <p className="text-sm text-text-secondary md:text-base">{subtitle}</p>
      </div>
      <div className="flex w-full items-center gap-3 md:w-[clamp(264px,30vw,500px)] md:shrink-0">
        <span className="shrink-0 text-sm whitespace-nowrap text-text-tertiary tabular-nums md:text-base">
          질문 {current} / {total}
        </span>
        <div
          role="progressbar"
          aria-label="면접 진행도"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={current}
          className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-fill"
        >
          <div
            className="h-full rounded-full bg-primary-bg transition-[width] duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </header>
  );
}
