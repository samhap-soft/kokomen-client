import { PrivateFeedback } from "@kokomen/types";
import {
  getScoreColor,
  getScoreIcon,
  getScoreLabel
} from "@/utils/rankDisplay";
import { Accordion } from "@kokomen/ui";
import { MessageSquare, Star, Award } from "lucide-react";
import { JSX } from "react";
import AnswerMemoComponent from "@/domains/interviewReport/components/answerMemo";

export function FeedbackAccordion({
  feedbacks
}: {
  feedbacks: PrivateFeedback[];
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
        />
      ))}
    </Accordion.Accordion>
  );
}

function FeedBackAccordionItem({
  feedback,
  idx
}: {
  feedback: PrivateFeedback;
  idx: number;
}): JSX.Element {
  return (
    <Accordion.AccordionItem
      key={feedback.question_id}
      itemKey={`feedback-${feedback.question_id}`}
      className="border border-border rounded-xl overflow-hidden bg-bg-elevated shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <Accordion.AccordionTrigger className="px-6 py-4 hover:bg-fill-secondary transition-colors duration-200">
        <div className="flex items-center gap-3 w-full">
          <div className="flex items-center justify-center w-8 h-8 bg-primary-bg rounded-full">
            <span className="text-sm font-semibold text-primary">
              {idx + 1}
            </span>
          </div>
          <span className="text-text-heading font-medium text-left flex-1">
            {feedback.question}
          </span>
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(
              feedback.answer_rank
            )}`}
          >
            {getScoreIcon(feedback.answer_rank)}
            {feedback.answer_rank}등급
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
            <div className="bg-primary-bg border border-primary-border rounded-xl p-4">
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
          <AnswerMemoComponent
            answerId={feedback.answer_id}
            answerMemoProp={feedback.submitted_answer_memo_content}
            tempMemo={feedback.temp_answer_memo_content}
            visibility={feedback.answer_memo_visibility}
          />
        </div>
      </Accordion.AccordionContent>
    </Accordion.AccordionItem>
  );
}
