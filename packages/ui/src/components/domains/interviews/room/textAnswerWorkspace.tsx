import { JSX, ReactNode } from "react";
import { Button } from "../../../button";
import { CurrentQuestion } from "./currentQuestion";

export interface TextAnswerWorkspaceProps {
  questionNumber: number;
  question: ReactNode;
  /** "초안 자동 저장됨" 같은 저장 상태 문구. 없으면 숨긴다 */
  draftStatus?: string;
  onOpenHistory: () => void;
  /** 질문 카드와 답변 사이에 끼우는 안내(제출 실패 · 제한 시간 등) */
  notice?: ReactNode;
  /** 답변 입력창. 입력 동작은 앱이 갖고 있으므로 그대로 받아서 배치만 한다 */
  children: ReactNode;
}

/**
 * Figma: "질문과 답변 작성"(1172:2452)
 *
 * 오른쪽 위 "면접 답변 기록" 버튼 → 고정된 현재 질문 → "나의 답변" 과 입력창.
 * 입력창이 남은 높이를 채운다. 높이가 모자라도 입력창은 160px 아래로 줄이지 않고, 패널이 스크롤된다.
 */
export function TextAnswerWorkspace({
  questionNumber,
  question,
  draftStatus,
  onOpenHistory,
  notice,
  children
}: TextAnswerWorkspaceProps): JSX.Element {
  return (
    <div className="flex flex-1 flex-col gap-4 lg:min-h-0 md:gap-6">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="secondary"
          size="large"
          onClick={onOpenHistory}
          className="bg-bg-base md:min-w-52"
        >
          면접 답변 기록
        </Button>
      </div>
      <CurrentQuestion number={questionNumber}>{question}</CurrentQuestion>
      {notice}
      <div className="flex min-h-[220px] flex-1 flex-col gap-2.5 lg:min-h-40">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-text-primary md:text-xl">
            나의 답변
          </h2>
          {draftStatus && (
            <span
              aria-live="polite"
              className="text-sm text-text-secondary md:text-base"
            >
              {draftStatus}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col lg:min-h-0">{children}</div>
      </div>
    </div>
  );
}
