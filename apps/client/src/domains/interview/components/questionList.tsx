import { getQuestions } from "@/domains/interview/api/questions";
import { Button, Modal, RoundSpinner } from "@kokomen/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { InterviewQuestion } from "@kokomen/types";
import { ErrorBoundary } from "@sentry/nextjs";

export default function QuestionList({
  category,
  onSelectQuestion,
  isOpen,
  closeModal
}: {
  category: string;
  // eslint-disable-next-line no-unused-vars
  onSelectQuestion: (question: InterviewQuestion) => void;
  isOpen: boolean;
  closeModal: () => void;
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title="문제 목록"
      size="3xl"
      className=""
      closeButton={true}
      backdropClose={true}
    >
      <ErrorBoundary
        fallback={
          <div className="text-center text-lg text-text-description">
            문제 목록을 불러오는 중 오류가 발생했습니다. <br /> 잠시 후 다시
            시도해주세요.
          </div>
        }
      >
        <Suspense
          fallback={
            <div className="flex justify-center items-center h-full">
              <RoundSpinner size="xl" />
            </div>
          }
        >
          <QuestionListContent
            category={category}
            onSelectQuestion={onSelectQuestion}
          />
        </Suspense>
      </ErrorBoundary>
    </Modal>
  );
}

function QuestionListContent({
  category,
  onSelectQuestion
}: {
  category: string;
  // eslint-disable-next-line no-unused-vars
  onSelectQuestion: (question: InterviewQuestion) => void;
}) {
  const { data: questions } = useSuspenseQuery({
    queryKey: ["questions", category],
    queryFn: () => getQuestions(category),
    retry: true,
    retryOnMount: true,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24
  });

  return (
    <div className="space-y-4 w-full h-full overflow-y-auto">
      <div className="space-y-2">
        <p className="text-lg font-bold">시작하고 싶은 질문을 골라주세요!</p>
        <p className="text-sm text-text-description">
          해당 질문으로 면접이 처음 시작됩니다.
        </p>
      </div>
      {questions.map((question) => (
        <Button
          variant={"outline"}
          size={"large"}
          key={question.id}
          onClick={() => onSelectQuestion(question)}
          className="w-full whitespace-normal"
        >
          {question.content}
        </Button>
      ))}
    </div>
  );
}
