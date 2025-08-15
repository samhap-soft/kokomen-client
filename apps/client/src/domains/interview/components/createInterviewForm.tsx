import { Category } from "@/api/category";
import useInterviewCreateMutation from "@/domains/interview/hooks/useInterviewCreateMutation";
import { InterviewType } from "@kokomen/types";
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
      <div className="bg-fill-quaternary rounded-2xl p-6 border border-border">
        <h3 className="text-lg font-semibold text-text-heading mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          면접 문제 개수
        </h3>
        <div className="flex items-center justify-center gap-6">
          <Button
            type="button"
            onClick={() => handleQuestionCountChange("minus")}
            className="w-12 h-12 bg-bg-elevated rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-2xl font-bold text-text-secondary hover:text-primary hover:scale-110 border border-border"
            variant="text"
          >
            -
          </Button>
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center shadow-xl">
            <span className="text-3xl font-bold text-text-light-solid">
              {questionCount}
            </span>
          </div>
          <Button
            type="button"
            onClick={() => handleQuestionCountChange("plus")}
            className="w-12 h-12 bg-bg-elevated rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-2xl font-bold text-text-secondary hover:text-primary hover:scale-110 border border-border"
            variant="text"
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
  selectedInterviewType: InterviewType;
  // eslint-disable-next-line no-unused-vars
  handleInterviewTypeChange: (type: InterviewType) => void;
};
const InterviewTypeSelector: MemoExoticComponent<
  FC<InterviewTypeSelectorProps>
> = memo(
  ({
    selectedInterviewType,
    handleInterviewTypeChange
  }: InterviewTypeSelectorProps) => {
    return (
      <div className="bg-fill-quaternary rounded-2xl p-6 border border-border">
        <h3 className="text-lg font-semibold text-text-heading mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          면접 방식
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            aria-selected={selectedInterviewType === "TEXT"}
            onClick={() => handleInterviewTypeChange("TEXT")}
            className="py-6"
            variant={selectedInterviewType === "TEXT" ? "primary" : "outline"}
          >
            <div className="flex flex-col items-center gap-2">
              <Keyboard className="w-6 h-6" />
              <span className="text-base font-medium">텍스트</span>
            </div>
          </Button>
          <Button
            type="button"
            aria-selected={selectedInterviewType === "VOICE"}
            onClick={() => handleInterviewTypeChange("VOICE")}
            className="py-6"
            variant={selectedInterviewType === "VOICE" ? "primary" : "outline"}
          >
            <div className="flex flex-col items-center gap-2">
              <MicVocal className="w-6 h-6" />
              <span className="text-base font-medium">음성</span>
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
  interviewType: InterviewType;
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
            variant="soft"
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
    useState<InterviewType>(
      DEFAULT_INTERVIEW_CONFIGS.INTERVIEW_TYPE as InterviewType
    );
  const { isOpen, openModal, closeModal } = useModal();
  const createInterviewMutation = useInterviewCreateMutation();

  const handleQuestionCountChange = useCallback((event: "plus" | "minus") => {
    setQuestionCount((prev) =>
      event === "plus"
        ? Math.min(DEFAULT_INTERVIEW_CONFIGS.MAX_QUESTION_COUNT, prev + 1)
        : Math.max(DEFAULT_INTERVIEW_CONFIGS.MIN_QUESTION_COUNT, prev - 1)
    );
  }, []);

  const handleInterviewTypeChange = useCallback((type: InterviewType) => {
    setSelectedInterviewType(type);
  }, []);

  const handleNewInterview = useCallback(() => {
    createInterviewMutation.mutate({
      category: selectedCategory.key,
      max_question_count: questionCount,
      mode: selectedInterviewType
    });
  }, [
    selectedCategory,
    questionCount,
    selectedInterviewType,
    createInterviewMutation
  ]);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      openModal();
    },
    [openModal]
  );

  const handleConfirmStart = useCallback(() => {
    closeModal();
    handleNewInterview();
  }, [closeModal, handleNewInterview]);

  return (
    <form
      className="w-full lg:flex-1 lg:min-w-0 flex flex-col"
      onSubmit={handleSubmit}
    >
      {/* 카테고리 탭 */}
      <nav className="w-full mb-8">
        <div className="bg-bg-elevated rounded-2xl p-2 shadow-lg border border-border">
          <div className="flex overflow-x-auto gap-1 p-2">
            {categories.map((category) => (
              <Button
                type="button"
                key={category.key}
                role="tab"
                className="text-sm font-semibold"
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
        </div>
      </nav>

      {/* 메인 컨텐츠(카테고리) */}
      <div className="bg-bg-elevated rounded-3xl border border-border shadow-2xl overflow-hidden">
        <div className="p-8 lg:p-12">
          <div className="text-center mb-12">
            <div className="relative inline-block mb-6">
              <Image
                src={selectedCategory.image_url}
                alt={selectedCategory.title}
                width={200}
                height={200}
                priority
                className="w-52 h-auto"
              />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-text-heading mb-4">
              {selectedCategory.title}
            </h1>
            <p className="text-lg text-text-description leading-relaxed max-w-2xl mx-auto">
              {selectedCategory.description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* 문제 개수 선택 */}
            <QuestionCountSelector
              questionCount={questionCount}
              handleQuestionCountChange={handleQuestionCountChange}
            />

            {/* 면접 타입 선택 */}
            <InterviewTypeSelector
              selectedInterviewType={selectedInterviewType}
              handleInterviewTypeChange={handleInterviewTypeChange}
            />
          </div>

          {/* 폼 제출 버튼 */}
          <div className="text-center flex flex-col items-center">
            <Button
              type="submit"
              disabled={createInterviewMutation.isPending}
              size={"large"}
              className="font-semibold text-lg w-full"
            >
              {createInterviewMutation.isPending ? (
                <span>면접 시작 중...</span>
              ) : (
                <span>{selectedCategory.title} 면접 시작하기</span>
              )}
            </Button>
            <p className="mt-4 text-sm text-text-description">
              선택한 카테고리의 {questionCount}개 문제로 면접을 진행합니다
            </p>
          </div>

          {/* 면접 시작 확인 모달 */}
          <InterviewStartModal
            isOpen={isOpen}
            closeModal={closeModal}
            onPressStart={handleConfirmStart}
            questionCount={questionCount}
            categoryTitle={selectedCategory.title}
            interviewType={selectedInterviewType}
          />
        </div>
      </div>
    </form>
  );
};

export default CreateInterviewForm;
