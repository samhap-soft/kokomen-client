import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/accordion";
import { useSidebar } from "@/hooks/useModal";
import { Sidebar } from "@kokomen/ui/components/sidebar/";
import { Button } from "@kokomen/ui/components/button";
import { SidebarIcon } from "lucide-react";
import { PrevQuestionAndAnswers } from "@/domains/interview/types";
import { JSX } from "react";

export const feedbacks: PrevQuestionAndAnswers = [
  {
    question_id: 1,
    question: "간단하게 자기소개를 해주세요.",
    answer:
      "안녕하세요. 저는 3년간 프론트엔드 개발을 해온 김개발입니다. 주로 React와 TypeScript를 사용해서 웹 애플리케이션을 개발해왔고, 최근에는 Next.js를 활용한 풀스택 개발에도 관심이 많습니다. 사용자 경험을 중시하며, 항상 더 나은 코드를 작성하기 위해 노력하고 있습니다.",
    answer_id: 1,
  },
  {
    question_id: 2,
    question: "최근에 해결한 기술적 문제에 대해 설명해 주세요.",
    answer:
      "최근 프로젝트에서 성능 이슈가 발생했었습니다. 페이지 로딩 속도가 느려져 사용자 경험이 저하되었는데, 이를 해결하기 위해 코드 스플리팅과 이미지 최적화를 적용했습니다. 결과적으로 페이지 로딩 시간이 50% 이상 단축되었습니다.",
    answer_id: 2,
  },
  {
    question_id: 3,
    question: "팀워크를 어떻게 유지하고 있나요?",
    answer:
      "저는 팀원들과의 소통을 중요하게 생각합니다. 정기적인 회의를 통해 진행 상황을 공유하고, 코드 리뷰를 통해 서로의 코드를 이해하려고 노력합니다. 또한, 팀원들의 의견을 존중하며 협업을 통해 더 나은 결과물을 만들어가고 있습니다.",
    answer_id: 3,
  },
];

export default function InterviewSideBar({
  prevQuestionAndAnswer = feedbacks,
}: {
  prevQuestionAndAnswer?: PrevQuestionAndAnswers;
}): JSX.Element {
  const { closeSidebar, open, openSidebar } = useSidebar();
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
            <AccordionItem
              key={idx}
              itemKey={`feedback-${feedback.question_id}`}
            >
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
