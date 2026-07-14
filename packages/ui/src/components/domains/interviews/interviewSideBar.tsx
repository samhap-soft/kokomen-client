import { Sidebar } from "../../sidebar";
import { Button } from "../../button";
import { QuestionAndAnswer } from "@kokomen/types";
import { SidebarIcon } from "lucide-react";
import { JSX } from "react";
import { CamelCasedProperties } from "@kokomen/types";
import * as Accordion from "../../accordion";
import AnswerContent, { extractMarkdownTitle } from "../../answerContent";

export default function InterviewSideBar({
  prevQuestionAndAnswer = [],
  open,
  openSidebar,
  closeSidebar,
  parseCode = false
}: {
  prevQuestionAndAnswer?: Omit<
    CamelCasedProperties<QuestionAndAnswer>,
    "answerId" | "questionId"
  >[];
  open: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  /** 라이브 코딩 면접 여부: true이면 제목/질문/답변을 마크다운으로 렌더 */
  parseCode?: boolean;
}): JSX.Element {
  return (
    <>
      <Button
        variant={"default"}
        onClick={openSidebar}
        className="fixed top-3 right-3"
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
        <Accordion.Accordion
          allowMultiple
          defaultActiveKey={["feedback-1"]}
          className="w-full"
        >
          {prevQuestionAndAnswer.length > 0 &&
            prevQuestionAndAnswer.map((feedback, idx) => (
              <Accordion.AccordionItem key={idx} itemKey={`question-${idx}`}>
                <Accordion.AccordionTrigger className="text-lg font-bold text-primary text-left">
                  <AnswerContent
                    content={
                      parseCode
                        ? extractMarkdownTitle(feedback.question)
                        : feedback.question
                    }
                    parseCode={parseCode}
                    inline
                  />
                </Accordion.AccordionTrigger>
                <Accordion.AccordionContent>
                  <div className="flex flex-col gap-3">
                    {/* 라이브 코딩: 제목만으로는 문제를 알 수 없으므로 질문 전문을 함께 표시 */}
                    {parseCode && (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block w-2 h-6 bg-text-tertiary rounded-sm"
                            aria-hidden="true"
                          ></span>
                          <p
                            className="text-lg font-semibold text-text-secondary"
                            aria-label="질문"
                          >
                            질문
                          </p>
                        </div>
                        <div className="bg-bg-elevated border border-border-input rounded-xl p-5">
                          <AnswerContent
                            content={feedback.question}
                            parseCode
                          />
                        </div>
                      </div>
                    )}
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
                      <AnswerContent
                        content={feedback.answer}
                        className="text-base text-gray-700"
                        parseCode={parseCode}
                      />
                    </div>
                  </div>
                </Accordion.AccordionContent>
              </Accordion.AccordionItem>
            ))}
        </Accordion.Accordion>
      </Sidebar>
    </>
  );
}
