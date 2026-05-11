import { Category } from "@/api/category";
import useInterviewCreateMutation from "@/domains/interview/hooks/useInterviewCreateMutation";
import { InterviewMode, InterviewQuestion } from "@kokomen/types";
import { useModal } from "@kokomen/utils";
import { Button, Modal } from "@kokomen/ui";
import { Keyboard, MicVocal, TriangleAlert } from "lucide-react";
import Image from "next/image";
import {
  FC,
  FormEvent,
  JSX,
  memo,
  MemoExoticComponent,
  useCallback,
  useState
} from "react";
import QuestionList from "@/domains/interview/components/questionList";

type QuestionCountSelectorProps = {
  questionCount: number;
  // eslint-disable-next-line no-unused-vars
  handleQuestionCountChange: (event: "plus" | "minus") => void;
};
const QuestionCountSelector: MemoExoticComponent<
  FC<QuestionCountSelectorProps>
> = memo(
  ({
    questionCount,
    handleQuestionCountChange
  }: QuestionCountSelectorProps) => {
    return (
      <div className="rounded-xl p-5 border border-border">
        <h3 className="text-sm font-semibold text-text-secondary mb-4">
          문제 개수
        </h3>
        <div className="flex items-center justify-center gap-5">
          <Button
            type="button"
            onClick={() => handleQuestionCountChange("minus")}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl font-bold"
            variant="soft"
          >
            -
          </Button>
          <span
            className="text-3xl font-bold text-text-heading tabular-nums w-10 text-center"
            data-testid="question-count"
          >
            {questionCount}
          </span>
          <Button
            type="button"
            onClick={() => handleQuestionCountChange("plus")}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl font-bold"
            variant="soft"
          >
            +
          </Button>
        </div>
      </div>
    );
  }
);
QuestionCountSelector.displayName = "QuestionCountSelector";

type InterviewTypeSelectorProps = {
  selectedInterviewType: InterviewMode;
  // eslint-disable-next-line no-unused-vars
  handleInterviewTypeChange: (type: InterviewMode) => void;
};
const InterviewTypeSelector: MemoExoticComponent<
  FC<InterviewTypeSelectorProps>
> = memo(
  ({
    selectedInterviewType,
    handleInterviewTypeChange
  }: InterviewTypeSelectorProps) => {
    return (
      <div className="rounded-xl p-5 border border-border">
        <h3 className="text-sm font-semibold text-text-secondary mb-4">
          면접 방식
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            aria-selected={selectedInterviewType === "TEXT"}
            onClick={() => handleInterviewTypeChange("TEXT")}
            className="py-4"
            variant={selectedInterviewType === "TEXT" ? "primary" : "soft"}
          >
            <div className="flex flex-col items-center gap-1.5">
              <Keyboard className="w-5 h-5" />
              <span className="text-sm font-medium">텍스트</span>
            </div>
          </Button>
          <Button
            type="button"
            aria-selected={selectedInterviewType === "VOICE"}
            onClick={() => handleInterviewTypeChange("VOICE")}
            className="py-4"
            variant={selectedInterviewType === "VOICE" ? "primary" : "soft"}
          >
            <div className="flex flex-col items-center gap-1.5">
              <MicVocal className="w-5 h-5" />
              <span className="text-sm font-medium">음성</span>
            </div>
          </Button>
        </div>
      </div>
    );
  }
);
InterviewTypeSelector.displayName = "InterviewTypeSelector";

const InterviewStartModal = ({
  isOpen,
  closeModal,
  onPressStart,
  questionCount,
  categoryTitle,
  interviewType
}: {
  isOpen: boolean;
  closeModal: () => void;
  onPressStart: () => void;
  questionCount: number;
  categoryTitle: string;
  interviewType: InterviewMode;
}) => {
  const requiredToken =
    interviewType === "VOICE" ? questionCount * 2 : questionCount;
  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="면접 시작하기">
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-text-heading mb-2">
            {categoryTitle} 면접을 시작하시겠습니까?
          </h3>
          <p className="text-sm text-text-description">
            선택한 카테고리의 {questionCount}개 문제로 면접을 진행합니다
          </p>
        </div>
        {interviewType === "VOICE" && (
          <div className="flex items-center gap-2 text-sm text-orange-6 text-center justify-center">
            <TriangleAlert />
            음성 면접은 토큰이 1문제당 2개씩 소모됩니다.
          </div>
        )}

        <div className="bg-fill-quaternary rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-text-heading">
              면접 진행 중 주의사항
            </span>
          </div>
          <ul className="text-sm text-text-description space-y-1 ml-5">
            <li>• 면접 진행 중에는 면접 중단이 불가능합니다</li>
            <li>
              • {interviewType === "VOICE" ? "음성" : "텍스트"} 방식으로 면접이
              진행됩니다
            </li>
            <li>• 총 {questionCount}개의 문제가 출제됩니다</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="cancel"
            size={"large"}
            onClick={closeModal}
            className="flex-1"
          >
            취소
          </Button>
          <Button
            type="button"
            size={"large"}
            variant="primary"
            onClick={onPressStart}
            className="flex-1"
          >
            시작하기(토큰 {requiredToken}개 소모)
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const DEFAULT_INTERVIEW_CONFIGS = {
  MAX_QUESTION_COUNT: 10,
  MIN_QUESTION_COUNT: 3,
  INTERVIEW_TYPE: "TEXT"
};
const CreateInterviewForm = ({
  categories
}: {
  categories: Category[];
}): JSX.Element => {
  const [selectedCategory, setSelectedCategory] = useState<Category>(
    categories[0]
  );
  const [questionCount, setQuestionCount] = useState<number>(
    DEFAULT_INTERVIEW_CONFIGS.MIN_QUESTION_COUNT as number
  );
  const [selectedInterviewType, setSelectedInterviewType] =
    useState<InterviewMode>(
      DEFAULT_INTERVIEW_CONFIGS.INTERVIEW_TYPE as InterviewMode
    );
  const [selectedQuestions, setSelectedQuestions] =
    useState<InterviewQuestion | null>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const {
    isOpen: isQuestionListOpen,
    openModal: openQuestionListModal,
    closeModal: closeQuestionListModal
  } = useModal();
  const { createRandomInterviewMutation, createCustomInterviewMutation } =
    useInterviewCreateMutation({ onMutate: () => closeQuestionListModal() });

  const handleQuestionCountChange = useCallback((event: "plus" | "minus") => {
    setQuestionCount((prev) =>
      event === "plus"
        ? Math.min(DEFAULT_INTERVIEW_CONFIGS.MAX_QUESTION_COUNT, prev + 1)
        : Math.max(DEFAULT_INTERVIEW_CONFIGS.MIN_QUESTION_COUNT, prev - 1)
    );
  }, []);

  const handleInterviewTypeChange = useCallback((type: InterviewMode) => {
    setSelectedInterviewType(type);
  }, []);

  const handleNewInterview = useCallback(
    (selectedQuestions: InterviewQuestion | null) => {
      if (selectedQuestions) {
        createCustomInterviewMutation.mutate({
          rootQuestionId: selectedQuestions.id,
          maxQuestionCount: questionCount,
          mode: selectedInterviewType
        });
      } else {
        createRandomInterviewMutation.mutate({
          category: selectedCategory.key,
          max_question_count: questionCount,
          mode: selectedInterviewType
        });
      }
    },
    [
      selectedCategory,
      questionCount,
      selectedInterviewType,
      createCustomInterviewMutation,
      createRandomInterviewMutation
    ]
  );

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      openModal();
    },
    [openModal]
  );

  const handleConfirmStart = useCallback(() => {
    closeModal();
    handleNewInterview(selectedQuestions);
  }, [closeModal, handleNewInterview, selectedQuestions]);

  const handleSelectQuestion = (question: InterviewQuestion) =>
    setSelectedQuestions(question);

  const isPending =
    createCustomInterviewMutation.isPending ||
    createRandomInterviewMutation.isPending;

  return (
    <form
      className="w-full lg:flex-1 lg:min-w-0 flex flex-col gap-6"
      onSubmit={handleSubmit}
    >
      {/* 카테고리 탭 */}
      <nav className="w-full">
        <div className="flex overflow-x-auto gap-1 border-b border-border pb-1">
          {categories.map((category) => (
            <Button
              type="button"
              key={category.key}
              role="tab"
              className="text-sm font-semibold whitespace-nowrap"
              aria-selected={selectedCategory.key === category.key}
              variant={
                selectedCategory.key === category.key ? "primary" : "text"
              }
              onClick={() => setSelectedCategory(category)}
            >
              {category.title}
            </Button>
          ))}
        </div>
      </nav>

      {/* 카테고리 소개 */}
      <div className="rounded-2xl border border-border overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-6 p-6">
          <Image
            src={selectedCategory.image_url}
            alt={selectedCategory.title}
            width={120}
            height={180}
            priority
            className="h-[180px] w-[120px] object-contain shrink-0"
          />
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold text-text-heading mb-2">
              {selectedCategory.title}
            </h1>
            <p className="text-sm text-text-description leading-relaxed">
              {selectedCategory.description}
            </p>
          </div>
        </div>
      </div>

      {/* 설정 */}
      <div className="grid grid-cols-2 gap-4">
        <QuestionCountSelector
          questionCount={questionCount}
          handleQuestionCountChange={handleQuestionCountChange}
        />
        <InterviewTypeSelector
          selectedInterviewType={selectedInterviewType}
          handleInterviewTypeChange={handleInterviewTypeChange}
        />
      </div>

      {/* 시작 버튼 */}
      <div className="flex flex-col gap-3">
        <Button
          type="button"
          variant={"soft"}
          disabled={isPending}
          size={"large"}
          className="font-semibold w-full"
          onClick={openQuestionListModal}
        >
          원하는 질문 선택해서 시작하기
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          size={"large"}
          className="font-semibold w-full"
          variant="submit"
        >
          {isPending ? "면접 시작 중..." : "랜덤 질문으로 시작하기"}
        </Button>
        <p className="text-center text-xs text-text-tertiary mt-1">
          선택한 카테고리의 {questionCount}개 문제로 면접을 진행합니다
        </p>
      </div>

      <QuestionList
        isOpen={isQuestionListOpen}
        closeModal={closeQuestionListModal}
        category={selectedCategory.key}
        onSelectQuestion={handleSelectQuestion}
      />
      <InterviewStartModal
        isOpen={isOpen}
        closeModal={closeModal}
        onPressStart={handleConfirmStart}
        questionCount={questionCount}
        categoryTitle={selectedCategory.title}
        interviewType={selectedInterviewType}
      />
    </form>
  );
};

export default CreateInterviewForm;
