import type { RequirementQuestion } from "@kokomen/types";
import { FormEvent, JSX, useState } from "react";
import { Button } from "../../button";

/** 역질문 한 개의 최대 길이. 서버도 같은 값으로 검증해야 한다(API 초안). */
export const REQUIREMENT_QUESTION_MAX_LENGTH: number = 200;

export interface RequirementPanelProps {
  items: RequirementQuestion[];
  maxCount: number;
  // eslint-disable-next-line no-unused-vars
  onAsk: (question: string) => void;
  onComplete: () => void;
  isAsking?: boolean;
  isCompleting?: boolean;
  disabled?: boolean;
}

/**
 * 요구사항 단계. 면접관에게 질문을 최대 maxCount 개 하고 "요구사항 정리 완료"로 넘어간다.
 * 질문을 다 쓰면 입력창을 숨기고 완료 버튼만 남긴다. 질문 없이 바로 완료할 수도 있다.
 */
export function RequirementPanel({
  items,
  maxCount,
  onAsk,
  onComplete,
  isAsking = false,
  isCompleting = false,
  disabled = false
}: RequirementPanelProps): JSX.Element {
  const [question, setQuestion] = useState<string>("");
  const remaining = Math.max(maxCount - items.length, 0);
  const trimmed = question.trim();

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!trimmed || isAsking || disabled || remaining === 0) return;
    onAsk(trimmed);
    setQuestion("");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-text-primary">
          요구사항 확인하기
        </h2>
        <span className="text-sm text-text-secondary tabular-nums">
          남은 질문 {remaining} / {maxCount}
        </span>
      </div>
      <p className="text-sm text-text-secondary">
        트래픽, 데이터 크기, 지연 목표처럼 설계에 필요한 조건을 면접관에게 물어보세요.
        답을 듣지 못한 조건은 가정하고 진행하면 돼요.
      </p>
      <ol
        aria-label="요구사항 질문과 답변"
        className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto"
      >
        {items.map((item, index) => (
          <li key={index} className="flex flex-col gap-1.5">
            <p className="self-end rounded-xl rounded-br-sm bg-primary-bg-light px-3 py-2 text-sm text-text-primary">
              {item.question}
            </p>
            <p className="self-start rounded-xl rounded-bl-sm bg-bg-base px-3 py-2 text-sm text-text-primary">
              <span className="mr-1 font-semibold text-text-secondary">면접관</span>
              {item.answer}
            </p>
          </li>
        ))}
        {isAsking && (
          <li className="self-start rounded-xl bg-bg-base px-3 py-2 text-sm text-text-tertiary">
            면접관이 답을 정리하고 있어요...
          </li>
        )}
      </ol>
      {remaining > 0 && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            aria-label="요구사항 질문"
            value={question}
            maxLength={REQUIREMENT_QUESTION_MAX_LENGTH}
            onChange={(event) => setQuestion(event.target.value)}
            disabled={disabled || isAsking}
            placeholder="예: 하루 요청 수는 어느 정도인가요?"
            className="min-w-0 flex-1 rounded-xl border border-primary-border bg-bg-base px-3 py-2.5 text-base text-text-primary outline-none placeholder:text-text-placeholder focus:border-primary-border-hover disabled:bg-bg-container-disabled"
          />
          <Button
            type="submit"
            variant="secondary"
            size="large"
            disabled={!trimmed || disabled || isAsking}
            className="bg-bg-base"
          >
            질문하기
          </Button>
        </form>
      )}
      <Button
        type="button"
        variant="primary"
        size="large"
        onClick={onComplete}
        disabled={disabled || isAsking || isCompleting}
        pendingSpinner={isCompleting}
        pendingText="정리하는 중.."
      >
        요구사항 정리 완료
      </Button>
    </div>
  );
}
