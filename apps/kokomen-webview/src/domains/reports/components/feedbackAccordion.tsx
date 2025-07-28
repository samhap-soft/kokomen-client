import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@kokomen/ui/components/accordion";
import { Score } from "@kokomen/ui/components/rank";
import { MessageSquare, Star, Award } from "lucide-react";
import { JSX } from "react";
import { PrivateFeedback } from "@kokomen/types/reports";
import AnswerMemoComponent from "@/domains/reports/components/answerMemo";
import { CamelCasedProperties } from "@kokomen/types/utils";

export function FeedbackAccordion({
  feedbacks
}: {
  feedbacks: CamelCasedProperties<PrivateFeedback>[];
}): JSX.Element {
  return (
    <Accordion
      allowMultiple
      defaultActiveKey={["feedback-1"]}
      className="w-full space-y-4"
    >
      {feedbacks.map((feedback, idx) => (
        <FeedBackAccordionItem
          key={feedback.questionId}
          feedback={feedback}
          idx={idx}
        />
      ))}
    </Accordion>
  );
}

function FeedBackAccordionItem({
  feedback,
  idx
}: {
  feedback: CamelCasedProperties<PrivateFeedback>;
  idx: number;
}): JSX.Element {
  return (
    <AccordionItem
      key={feedback.questionId}
      itemKey={`feedback-${feedback.questionId}`}
      className="rounded-xl overflow-hidden bg-bg-elevated shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <AccordionTrigger className="px-6 py-4 hover:bg-fill-secondary transition-colors duration-200">
        <div className="flex items-center gap-3 w-full">
          <div className="flex items-center justify-center w-8 h-8 bg-primary-bg rounded-full">
            <span className="text-sm font-semibold text-primary">
              {idx + 1}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-text-heading font-medium text-left flex-1">
              {feedback.question}
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6">
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
                {feedback.answerFeedback}
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
              <Score rank={feedback.answerRank} />
            </div>
          </div>
          <AnswerMemoComponent
            answerId={feedback.answerId}
            answerMemoProp={feedback.submittedAnswerMemoContent}
            tempMemo={feedback.tempAnswerMemoContent}
            visibility={feedback.answerMemoVisibility}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
