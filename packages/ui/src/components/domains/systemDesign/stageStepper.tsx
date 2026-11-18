import type { SystemDesignStage } from "@kokomen/types";
import { JSX } from "react";
import { cn } from "../../../utils";

const STAGES: readonly { stage: SystemDesignStage; label: string }[] = [
  { stage: "REQUIREMENTS", label: "요구사항" },
  { stage: "HIGH_LEVEL", label: "개략 설계" },
  { stage: "DEEP_DIVE", label: "심화" }
];

export interface StageStepperProps {
  current: SystemDesignStage;
  /** 면접이 끝나면 모든 단계를 완료로 표시한다 */
  isFinished?: boolean;
  className?: string;
}

/** 요구사항 → 개략 설계 → 심화 중 지금 단계를 보여준다. */
export function StageStepper({
  current,
  isFinished = false,
  className
}: StageStepperProps): JSX.Element {
  const currentIndex = STAGES.findIndex((item) => item.stage === current);

  return (
    <ol aria-label="면접 단계" className={cn("flex items-center gap-2", className)}>
      {STAGES.map((item, index) => {
        const isDone = isFinished || index < currentIndex;
        const isCurrent = !isFinished && index === currentIndex;
        return (
          <li
            key={item.stage}
            aria-current={isCurrent ? "step" : undefined}
            className="flex min-w-0 items-center gap-2"
          >
            {index > 0 && (
              <span
                aria-hidden="true"
                className={cn(
                  "h-px w-4 shrink-0 sm:w-6",
                  isDone || isCurrent ? "bg-primary" : "bg-fill"
                )}
              />
            )}
            <span
              className={cn(
                "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-semibold whitespace-nowrap",
                isCurrent && "bg-primary-bg text-text-primary",
                isDone && "bg-primary-bg-light text-primary-text",
                !isDone && !isCurrent && "bg-fill-tertiary text-text-tertiary"
              )}
            >
              <span className="tabular-nums">{index + 1}</span>
              {item.label}
              {isDone && <span className="sr-only">(완료)</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
