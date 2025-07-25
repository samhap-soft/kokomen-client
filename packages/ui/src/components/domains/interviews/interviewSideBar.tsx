import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@components/accordion";
import { Sidebar } from "@components/sidebar/";
import { QuestionAndAnswer } from "@kokomen/types/interviews";
import { SidebarIcon } from "lucide-react";
import { JSX } from "react";
import { Button } from "@components/button";

export default function InterviewSideBar({
  prevQuestionAndAnswer = [],
  open,
  openSidebar,
  closeSidebar
}: {
  prevQuestionAndAnswer?: Omit<
    QuestionAndAnswer,
    "answer_id" | "question_id"
  >[];
  open: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
}): JSX.Element {
  return (
    <>
      <Button
        variant={"text"}
        onClick={openSidebar}
        className="fixed top-4 right-4"
        role="button"
        aria-label="사이드바 열기"
        title="사이드바 열기"
      >
        <SidebarIcon />
      </Button>
      <Sidebar open={open} onClose={closeSidebar}>
        <div className="text-2xl font-bold text-primary p-4">
          내 질문과 답변
        </div>
        <Accordion
          allowMultiple
          defaultActiveKey={["feedback-1"]}
          className="w-full"
        >
          {prevQuestionAndAnswer.map((feedback, idx) => (
            <AccordionItem key={idx} itemKey={`question-${idx}`}>
              <AccordionTrigger className="text-lg font-bold text-primary">
                {feedback.question}
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="inline-block w-2 h-6 bg-primary rounded-sm"
                      aria-hidden="true"
                    ></span>
                    <p
                      className="text-lg font-semibold text-primary"
                      aria-label="내 답변"
                    >
                      내 답변
                    </p>
                  </div>
                  <div className="bg-white border border-border-input rounded-xl shadow-md p-5 transition-all duration-200 hover:shadow-lg">
                    <p className="text-base text-gray-700 leading-relaxed">
                      {feedback.answer}
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Sidebar>
    </>
  );
}
