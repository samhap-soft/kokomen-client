import { PrivateFeedback } from "@kokomen/types";
import {
  getScoreColor,
  getScoreIcon,
  getScoreLabel
} from "@/utils/rankDisplay";
import { Accordion, Tooltip } from "@kokomen/ui";
import { MessageSquare, Star, Award, HelpCircle, LogIn } from "lucide-react";
import { JSX } from "react";
import AnswerMemoComponent from "@/domains/interviewReport/components/answerMemo";
import { Button } from "@kokomen/ui";
import Link from "next/link";

function RankGuideTooltip(): JSX.Element {
  return (
    <Tooltip className="cursor-help" onClick={(e) => e.stopPropagation()}>
      <HelpCircle className="w-4 h-4 text-text-tertiary hover:text-text-secondary transition-colors" />
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
  isGuest
}: {
  feedbacks: PrivateFeedback[];
  isGuest?: boolean;
}): JSX.Element {
  return (
    <Accordion.Accordion
      allowMultiple
      defaultActiveKey={["feedback-1"]}
      className="w-full space-y-4"
    >
      {feedbacks.map((feedback, idx) => (
        <FeedBackAccordionItem
          key={feedback.question_id}
          feedback={feedback}
          idx={idx}
          isGuest={isGuest}
        />
      ))}
    </Accordion.Accordion>
  );
}

function FeedBackAccordionItem({
  feedback,
  idx,
  isGuest
}: {
  feedback: PrivateFeedback;
  idx: number;
  isGuest?: boolean;
}): JSX.Element {
  return (
    <Accordion.AccordionItem
      key={feedback.question_id}
      itemKey={`feedback-${feedback.question_id}`}
      className="border-border rounded-xl  bg-bg-elevated shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <Accordion.AccordionTrigger className="px-6 py-4 hover:bg-fill-secondary transition-colors duration-200 rounded-xl">
        <div className="flex items-center gap-3 w-full">
          <div className="flex items-center justify-center w-8 h-8 rounded-full">
            <span className="text-sm font-semibold text-primary">
              {idx + 1}
            </span>
          </div>
          <div className="flex flex-col justify-center gap-1 w-full">
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 py-1 rounded-full text-sm font-semibold ${getScoreColor(
                  feedback.answer_rank
                )}`}
              >
                {getScoreIcon(feedback.answer_rank)}
                {feedback.answer_rank}등급
              </div>
              <RankGuideTooltip />
            </div>
            <span className="text-text-heading font-medium text-left flex-1">
              {feedback.question}
            </span>
          </div>
        </div>
      </Accordion.AccordionTrigger>
      <Accordion.AccordionContent className="px-6">
        <div className="flex flex-col gap-6">
          {/* 내 답변 섹션 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h4 className="text-lg font-semibold text-text-heading">
                내 답변
              </h4>
            </div>
            <div className="bg-primary-light border border-primary-border rounded-xl p-4">
              <p className="text-text-primary leading-relaxed">
                {feedback.answer}
              </p>
            </div>
          </div>

          {/* 피드백 섹션 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-success" />
              <h4 className="text-lg font-semibold text-text-heading">
                피드백
              </h4>
            </div>
            <div className="bg-success-bg border border-success-border rounded-xl p-4">
              <p className="text-text-primary leading-relaxed">
                {feedback.answer_feedback}
              </p>
            </div>
          </div>

          {/* 점수 요약 */}
          <div className="flex items-center pt-4 border-t border-border gap-4">
            <div className="flex gap-2">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-warning" />
                <span className="text-text-description font-medium">
                  이 질문의 평가
                </span>
              </div>
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${getScoreColor(
                  feedback.answer_rank
                )}`}
              >
                {getScoreIcon(feedback.answer_rank)}
                <span className="text-lg">
                  {feedback.answer_rank}등급 (
                  {getScoreLabel(feedback.answer_rank)})
                </span>
              </div>
            </div>
          </div>
          {isGuest ? (
            <div className="border border-border-secondary p-4 rounded-lg flex flex-col justify-between items-center gap-3">
              <p className="text-sm text-text-secondary">
                로그인하면 메모를 작성하고 나만의 오답노트를 정리할 수 있어요.
              </p>
              <Link href="/login?redirectTo=/interviews" className="w-full">
                <Button className="w-full" variant="glass">
                  <LogIn className="w-4 h-4 mr-2" />
                  로그인하고 내 오답 정리하기
                </Button>
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
