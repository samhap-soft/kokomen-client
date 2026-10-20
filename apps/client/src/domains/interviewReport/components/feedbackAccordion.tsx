import { PrivateFeedback } from "@kokomen/types";
import {
  Accordion,
  AnswerContent,
  Badge,
  buttonVariants,
  HelpIcon,
  Tooltip
} from "@kokomen/ui";
import { JSX } from "react";
import AnswerMemoComponent from "@/domains/interviewReport/components/answerMemo";
import {
  getRankBadgeLabel,
  getRankBadgeType,
  RankLabel
} from "@/domains/interviewReport/components/rankLabel";
import Link from "next/link";

function RankGuideTooltip(): JSX.Element {
  return (
    <Tooltip className="cursor-help" onClick={(e) => e.stopPropagation()}>
      <HelpIcon
        size={16}
        aria-label="등급 가이드"
        className="text-text-tertiary transition-colors hover:text-text-secondary"
      />
      <Tooltip.Content
        placement="top"
        className="!whitespace-normal w-72 !pointer-events-auto"
      >
        <div className="space-y-1.5 text-xs">
          <p className="font-semibold text-sm mb-2 border-b border-gray-600 pb-1.5">
            등급 가이드
          </p>
          <p>
            <span className="text-green-400 font-semibold">A등급 (우수)</span>:
            답변이 명확하고 체계적이며, 핵심 개념을 정확히 설명함
          </p>
          <p>
            <span className="text-blue-400 font-semibold">B등급 (양호)</span>:
            대체로 적절한 답변이나, 일부 세부 설명이 부족함
          </p>
          <p>
            <span className="text-yellow-400 font-semibold">C등급 (보통)</span>:
            기본 개념은 이해하고 있으나, 구조와 체계가 다소 부족함
          </p>
          <p>
            <span className="text-red-400 font-semibold">D등급 (미흡)</span>:
            핵심 내용이 누락되었거나, 설명이 불충분함
          </p>
          <p>
            <span className="text-red-400 font-semibold">F등급 (불량)</span>:
            질문 의도를 파악하지 못했거나, 답변이 부적절함
          </p>
        </div>
      </Tooltip.Content>
    </Tooltip>
  );
}

export function FeedbackAccordion({
  feedbacks,
  isGuest,
  parseCode = false,
  startIndex = 0,
  defaultOpenFirst = true
}: {
  feedbacks: PrivateFeedback[];
  isGuest?: boolean;
  parseCode?: boolean;
  /** 질문 번호를 이어서 매길 때의 시작 인덱스(게스트 블러 영역용). */
  startIndex?: number;
  defaultOpenFirst?: boolean;
}): JSX.Element {
  const firstItemKey =
    defaultOpenFirst && feedbacks[0]
      ? `feedback-${feedbacks[0].question_id}`
      : undefined;

  return (
    <Accordion.Accordion
      allowMultiple
      defaultActiveKey={firstItemKey}
      className="flex w-full flex-col gap-5 divide-y-0"
    >
      {feedbacks.map((feedback, idx) => (
        <FeedBackAccordionItem
          key={feedback.question_id}
          feedback={feedback}
          number={startIndex + idx + 1}
          isGuest={isGuest}
          parseCode={parseCode}
        />
      ))}
    </Accordion.Accordion>
  );
}

function FeedBackAccordionItem({
  feedback,
  number,
  isGuest,
  parseCode
}: {
  feedback: PrivateFeedback;
  number: number;
  isGuest?: boolean;
  parseCode?: boolean;
}): JSX.Element {
  return (
    <Accordion.AccordionItem
      itemKey={`feedback-${feedback.question_id}`}
      className="overflow-hidden rounded-[20px] border border-border bg-bg-elevated"
    >
      <Accordion.AccordionTrigger className="gap-3">
        <span className="flex flex-1 gap-2 text-left">
          <span className="shrink-0">{number}.</span>
          <AnswerContent
            content={feedback.question}
            parseCode={parseCode}
            inline
          />
        </span>
      </Accordion.AccordionTrigger>
      {/* Figma 에서 접힌 상태에도 등급 행이 보이므로 Content 밖에 둔다. */}
      <div className="flex items-center gap-3 px-4 py-4 sm:px-6">
        <span className="flex items-center gap-1 text-sm text-text-secondary">
          이 질문의 평가
          <RankGuideTooltip />
        </span>
        <RankLabel rank={feedback.answer_rank} />
      </div>
      <Accordion.AccordionContent>
        <div className="flex flex-col gap-5 px-0 pb-2 sm:px-2">
          <div className="flex flex-col gap-1.5">
            <h4 className="text-base font-semibold text-text-primary">
              내 답변
            </h4>
            <div className="rounded-xl bg-bg-layout p-5 text-base text-text-secondary">
              <AnswerContent content={feedback.answer} parseCode={parseCode} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <h4 className="text-base font-semibold text-text-primary">
              AI 피드백
            </h4>
            <div className="flex flex-col items-start gap-3 rounded-xl bg-primary-1 p-5">
              <Badge
                appearance="weak"
                type={getRankBadgeType(feedback.answer_rank)}
              >
                {getRankBadgeLabel(feedback.answer_rank)}
              </Badge>
              <p className="whitespace-pre-line text-base text-text-secondary">
                {feedback.answer_feedback}
              </p>
            </div>
          </div>

          {isGuest ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-border p-4">
              <p className="text-sm text-text-secondary">
                로그인하면 메모를 작성하고 나만의 오답노트를 정리할 수 있어요.
              </p>
              <Link
                href="/login?redirectTo=/interviews"
                className={buttonVariants({
                  variant: "secondary",
                  className: "w-full"
                })}
              >
                로그인하고 내 오답 정리하기
              </Link>
            </div>
          ) : (
            <AnswerMemoComponent
              answerId={feedback.answer_id}
              answerMemoProp={feedback.submitted_answer_memo_content}
              tempMemo={feedback.temp_answer_memo_content}
              visibility={feedback.answer_memo_visibility}
            />
          )}
        </div>
      </Accordion.AccordionContent>
    </Accordion.AccordionItem>
  );
}
