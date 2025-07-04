import { Category } from "@/api/category";
import { startNewInterview } from "@/domains/interview/api";
import { InterviewType } from "@/domains/interview/types";
import { Button } from "@kokomen/ui/components/button";
import { useToast } from "@kokomen/ui/hooks/useToast";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Keyboard, MicVocal } from "lucide-react";
import { useRouter } from "next/router";
import { FC, memo, MemoExoticComponent, useCallback, useState } from "react";

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
    handleQuestionCountChange,
  }: QuestionCountSelectorProps) => {
    return (
      <div className="bg-fill-quaternary rounded-2xl p-6 border border-border">
        <h3 className="text-lg font-semibold text-text-heading mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          면접 문제 개수
        </h3>
        <div className="flex items-center justify-center gap-6">
          <Button
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
    handleInterviewTypeChange,
  }: InterviewTypeSelectorProps) => {
    return (
      <div className="bg-fill-quaternary rounded-2xl p-6 border border-border">
        <h3 className="text-lg font-semibold text-text-heading mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          면접 방식
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Button
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
  INTERVIEW_TYPE: "text",
};
const CreateInterviewForm: MemoExoticComponent<
  FC<{ selectedCategory: Category }>
> = memo(({ selectedCategory }: { selectedCategory: Category }) => {
  const router = useRouter();
  const { error: errorToast } = useToast();
  const [questionCount, setQuestionCount] = useState<number>(
    DEFAULT_INTERVIEW_CONFIGS.MIN_QUESTION_COUNT as number
  );
  const [selectedInterviewType, setSelectedInterviewType] =
    useState<InterviewType>("text");
  const createInterviewMutation = useMutation({
    mutationFn: startNewInterview,
    onSuccess: (data) => {
      router.push({
        pathname: `/interviews/${data.interview_id}`,
      });
    },

    onError: (error) => {
      if (isAxiosError(error)) {
        if (error.response?.status === 401) {
          router.replace("/login");
        }
        errorToast({
          title: "면접 생성 실패",
          description: error.response?.data.message,
        });
      }
    },
    onSettled: () => {
      console.log("Interview creation attempt completed");
    },
    retry: (failureCount, error) => {
      if (isAxiosError(error)) {
        if (
          error.response?.status &&
          error.response.status >= 400 &&
          error.response.status < 500
        ) {
          return false;
        }

        return failureCount < 2;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

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
      max_question_count: questionCount,
    });
  }, [selectedCategory, questionCount, createInterviewMutation]);

  return (
    <>
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
      <div className="text-center flex flex-col items-center">
        <Button
          type="button"
          onClick={handleNewInterview}
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
    </>
  );
});

CreateInterviewForm.displayName = "CreateInterviewForm";

export default CreateInterviewForm;
