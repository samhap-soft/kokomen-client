import { JSX } from "react";
import { Button } from "../../../button";
import AnswerContent from "../../../answerContent";

export interface AnswerHistoryItem {
  question: string;
  answer: string;
}

export interface AnswerHistoryPanelProps {
  items: AnswerHistoryItem[];
  onBack: () => void;
  /** 라이브 코딩처럼 질문 · 답변이 마크다운(코드 블록)일 때 true */
  parseCode?: boolean;
}

/**
 * Figma: "이번 면접 답변 기록"(1172:2553)
 *
 * 예전 사이드바(InterviewSideBar)를 대신한다. 답변 작성 패널 자리를 바꿔서 보여준다.
 */
export function AnswerHistoryPanel({
  items,
  onBack,
  parseCode = false
}: AnswerHistoryPanelProps): JSX.Element {
  return (
    <div className="flex flex-1 flex-col gap-4 lg:min-h-0 md:gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-xl font-bold text-text-primary md:text-2xl">
            이번 면접 답변 기록
          </h2>
          <p className="text-sm text-text-secondary md:text-base">
            제출한 답변 {items.length}개 · 질문 순서대로 표시
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="large"
          onClick={onBack}
          className="self-start bg-bg-base sm:self-auto md:min-w-56"
        >
          답변 작성으로 돌아가기
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="rounded-xl bg-bg-base p-6 text-center text-text-secondary">
          아직 제출한 답변이 없어요.
        </p>
      ) : (
        <ol className="flex flex-col gap-4 lg:min-h-0 lg:overflow-y-auto">
          {items.map((item, index) => (
            <li
              key={index}
              className="flex flex-col gap-3 rounded-xl bg-bg-base p-4 md:p-6"
            >
              <span className="text-sm font-semibold text-text-secondary md:text-base">
                질문 {String(index + 1).padStart(2, "0")}
              </span>
              <AnswerContent
                content={item.question}
                parseCode={parseCode}
                className="text-lg font-semibold text-text-primary md:text-xl"
              />
              <hr className="border-border" />
              <span className="text-sm font-semibold text-text-secondary md:text-base">
                내 답변
              </span>
              <AnswerContent
                content={item.answer}
                parseCode={parseCode}
                className="text-base text-text-primary"
              />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
