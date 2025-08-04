import { Category } from "@/api/category";
import useInterviewCreateMutation from "@/domains/interview/hooks/useInterviewCreateMutation";
import { InterviewType } from "@/domains/interview/types";
import { Button } from "@kokomen/ui";
import { Keyboard, MicVocal } from "lucide-react";
import Image from "next/image";
import {
  FC,
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
            aria-selected={selectedInterviewType === "text"}
            onClick={() => handleInterviewTypeChange("text")}
            className="py-6"
            variant={selectedInterviewType === "text" ? "primary" : "outline"}
          >
            <div className="flex flex-col items-center gap-2">
              <Keyboard className="w-6 h-6" />
              <span className="text-sm font-medium">텍스트</span>
            </div>
          </Button>
          <Button
            type="button"
            aria-selected={selectedInterviewType === "voice"}
            onClick={() => handleInterviewTypeChange("voice")}
            className="py-6"
            disabled
            variant={selectedInterviewType === "voice" ? "primary" : "outline"}
          >
            <div className="flex flex-col items-center gap-2">
              <MicVocal className="w-6 h-6" />
              <span className="text-sm font-medium">음성</span>
            </div>
          </Button>
        </div>
      </div>
    );
  }
);
InterviewTypeSelector.displayName = "InterviewTypeSelector";

const DEFAULT_INTERVIEW_CONFIGS: Record<string, string | number> = {
  MAX_QUESTION_COUNT: 20,
  MIN_QUESTION_COUNT: 3,
  INTERVIEW_TYPE: "text"
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
    useState<InterviewType>("text");
  const createInterviewMutation = useInterviewCreateMutation();

  const handleQuestionCountChange = useCallback((event: "plus" | "minus") => {
    setQuestionCount((prev) =>
      event === "plus" ? Math.min(20, prev + 1) : Math.max(3, prev - 1)
    );
  }, []);

  const handleInterviewTypeChange = useCallback((type: InterviewType) => {
    setSelectedInterviewType(type);
  }, []);

  const handleNewInterview = useCallback(() => {
    createInterviewMutation.mutate({
      category: selectedCategory.key,
      max_question_count: questionCount
    });
  }, [selectedCategory, questionCount, createInterviewMutation]);
  return (
    <form
      className="w-full lg:flex-1 lg:min-w-0 flex flex-col"
      onSubmit={(e) => {
        e.preventDefault();
        handleNewInterview();
      }}
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
        </div>
      </div>
    </form>
  );
};

export default CreateInterviewForm;
