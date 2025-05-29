import { Feedback } from "@/domains/interviewReport/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@kokomen/ui/components/accordion";
export function FeedbackAccordion({ feedbacks }: { feedbacks: Feedback[] }) {
  return (
    <Accordion
      allowMultiple
      defaultActiveKey={["feedback-1"]}
      className="w-full"
    >
      {feedbacks.map((feedback, idx) => (
        <AccordionItem key={idx} itemKey={`feedback-${feedback.question_id}`}>
          <AccordionTrigger>{feedback.question}</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xl font-bold">내 답변</p>
                <p className="border border-border-input p-4 rounded-xl">
                  {feedback.answer}
                </p>
              </div>
              <div>
                <p className="text-xl font-bold">피드백</p>
                <p className="border border-border-input p-4 rounded-xl">
                  {feedback.answer_feedback}
                </p>
              </div>
              <span>점수: {feedback.answer_rank}</span>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
