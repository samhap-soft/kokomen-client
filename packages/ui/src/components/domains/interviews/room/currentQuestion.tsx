import { JSX, ReactNode } from "react";
import { cn } from "../../../../utils";

export interface CurrentQuestionProps {
  /** 1부터 시작하는 질문 번호 */
  number: number;
  /** 질문 본문. 문자열이 아니면(마크다운 렌더 결과 등) 그대로 그린다 */
  children: ReactNode;
  /**
   * card: 텍스트 면접의 고정된 질문 카드 (Figma 1172:2455)
   * bar: 음성 면접의 한 줄 질문 (Figma 1172:2497)
   */
  variant?: "card" | "bar";
  className?: string;
}

/** 질문이 바뀌면 스크린리더가 새 질문을 읽도록 live region 으로 감싼다. */
export function CurrentQuestion({
  number,
  children,
  variant = "card",
  className
}: CurrentQuestionProps): JSX.Element {
  const label =
    variant === "card"
      ? `질문 ${String(number).padStart(2, "0")}`
      : `질문 ${number}`;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        variant === "card"
          ? "flex flex-col gap-2 rounded-xl bg-bg-base p-4 md:p-5"
          : "flex items-baseline gap-3.5 rounded-xl bg-bg-layout px-4 py-3 md:px-5 md:py-[14px]",
        className
      )}
    >
      <span className="shrink-0 text-sm font-semibold text-text-secondary md:text-base">
        {label}
      </span>
      <div className="min-w-0 flex-1 text-lg font-bold break-keep text-text-primary md:text-2xl">
        {children}
      </div>
    </div>
  );
}
