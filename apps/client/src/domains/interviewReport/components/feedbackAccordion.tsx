import { Feedback } from "@/domains/interviewReport/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@kokomen/ui/components/accordion";
import {
  MessageSquare,
  Star,
  Award,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export function FeedbackAccordion({ feedbacks }: { feedbacks: Feedback[] }) {
  const getScoreColor = (rank: string) => {
    switch (rank.toUpperCase()) {
      case "A":
        return "text-success";
      case "B":
        return "text-primary";
      case "C":
        return "text-warning";
      case "D":
      case "F":
        return "text-error";
      default:
        return "text-text-description";
    }
  };

  const getScoreIcon = (rank: string) => {
    switch (rank.toUpperCase()) {
      case "A":
        return <Award className="w-5 h-5" />;
      case "B":
        return <Star className="w-5 h-5" />;
      case "C":
        return <CheckCircle className="w-5 h-5" />;
      case "D":
      case "F":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Star className="w-5 h-5" />;
    }
  };

  const getScoreLabel = (rank: string) => {
    switch (rank.toUpperCase()) {
      case "A":
        return "우수";
      case "B":
        return "양호";
      case "C":
        return "보통";
      case "D":
        return "미흡";
      case "F":
        return "불량";
      default:
        return rank;
    }
  };

  return (
    <Accordion
      allowMultiple
      defaultActiveKey={["feedback-1"]}
      className="w-full space-y-4"
    >
      {feedbacks.map((feedback, idx) => (
        <AccordionItem
          key={idx}
          itemKey={`feedback-${feedback.question_id}-${idx}`}
          className="border border-border rounded-xl overflow-hidden bg-bg-elevated shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <AccordionTrigger className="px-6 py-4 hover:bg-fill-secondary transition-colors duration-200">
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
          </AccordionTrigger>
          <AccordionContent className="px-6">
            <div className="space-y-6">
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
              <div className="flex items-center justify-between pt-4 border-t border-border">
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
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
