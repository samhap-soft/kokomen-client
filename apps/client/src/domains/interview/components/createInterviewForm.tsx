import { Category } from "@/api/category";
import useInterviewCreateMutation from "@/domains/interview/hooks/useInterviewCreateMutation";
import { InterviewMode, InterviewQuestion } from "@kokomen/types";
import { useModal } from "@kokomen/utils";
import {
  AddIcon,
  AlertIcon,
  Button,
  Chip,
  Modal,
  Skeleton,
  SubtractionIcon,
  Tab,
  Tooltip
} from "@kokomen/ui";
import { useQuery } from "@tanstack/react-query";
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
import {
  CATEGORY_GROUPS,
  ETC_CATEGORY_GROUP_TITLE,
  IS_VOICE_MODE_DISABLED,
  MINUTES_PER_QUESTION,
  SAMPLE_QUESTION_COUNT,
  VOICE_MODE_DISABLED_MESSAGE
} from "@/domains/interview/constants";
import { getQuestions } from "@/domains/interview/api/questions";
import { interviewQuestionKeys } from "@/utils/querykeys";

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
      <div className="flex flex-col gap-2">
        <h3 className="text-base font-medium text-text-secondary">문제 개수</h3>
        <div className="flex items-center justify-between rounded-xl bg-bg-elevated px-4 py-2">
          <Button
            type="button"
            aria-label="문제 수 줄이기"
            onClick={() => handleQuestionCountChange("minus")}
            className="p-3"
            variant="primary-soft"
          >
            <SubtractionIcon />
          </Button>
          <span
            className="text-2xl font-semibold text-text-primary tabular-nums"
            data-testid="question-count"
          >
            {questionCount}문제
          </span>
          <Button
            type="button"
            aria-label="문제 수 늘리기"
            onClick={() => handleQuestionCountChange("plus")}
            className="p-3"
            variant="primary-soft"
          >
            <AddIcon />
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
      <div className="flex flex-col gap-2">
        <h3 className="text-base font-medium text-text-secondary">면접 방식</h3>
        <Tab aria-label="면접 방식">
          <Tab.Item
            selected={selectedInterviewType === "TEXT"}
            onClick={() => handleInterviewTypeChange("TEXT")}
          >
            텍스트
          </Tab.Item>
          <Tooltip
            className="flex flex-1"
            tabIndex={IS_VOICE_MODE_DISABLED ? 0 : undefined}
          >
            <Tab.Item
              disabled={IS_VOICE_MODE_DISABLED}
              selected={selectedInterviewType === "VOICE"}
              onClick={() => handleInterviewTypeChange("VOICE")}
            >
              음성
            </Tab.Item>
            {IS_VOICE_MODE_DISABLED && (
              // 오른쪽 끝 탭이라 좁은 화면에서는 가운데 정렬 시 화면 밖으로 넘친다.
              <Tooltip.Content className="max-sm:right-0 max-sm:left-auto max-sm:translate-x-0">
                {VOICE_MODE_DISABLED_MESSAGE}
              </Tooltip.Content>
            )}
          </Tooltip>
        </Tab>
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
  interviewType,
  isLiveCoding
}: {
  isOpen: boolean;
  closeModal: () => void;
  onPressStart: () => void;
  questionCount: number;
  categoryTitle: string;
  interviewType: InterviewMode;
  isLiveCoding: boolean;
}) => {
  const effectiveType: InterviewMode = isLiveCoding ? "TEXT" : interviewType;
  const requiredToken =
    effectiveType === "VOICE" ? questionCount * 2 : questionCount;
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
        {isLiveCoding && interviewType === "VOICE" && (
          <div className="flex items-center gap-2 text-sm text-blue-6 text-center justify-center">
            <AlertIcon size={20} />
            라이브 코딩 문제는 텍스트 모드로 진행됩니다.
          </div>
        )}
        {effectiveType === "VOICE" && (
          <div className="flex items-center gap-2 text-sm text-orange-6 text-center justify-center">
            <AlertIcon size={20} />
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
              •{" "}
              {isLiveCoding
                ? "라이브 코딩(텍스트)"
                : effectiveType === "VOICE"
                  ? "음성"
                  : "텍스트"}{" "}
              방식으로 면접이 진행됩니다
            </li>
            <li>• 총 {questionCount}개의 문제가 출제됩니다</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
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

const groupCategories = (
  categories: Category[]
): { title: string; categories: Category[] }[] => {
  const groupedKeys = new Set(CATEGORY_GROUPS.flatMap((group) => group.keys));
  const groups = CATEGORY_GROUPS.map((group) => ({
    title: group.title,
    categories: group.keys
      .map((key) => categories.find((category) => category.key === key))
      .filter((category): category is Category => category !== undefined)
  }));
  const etcCategories = categories.filter(
    (category) => !groupedKeys.has(category.key)
  );
  return [
    ...groups,
    { title: ETC_CATEGORY_GROUP_TITLE, categories: etcCategories }
  ].filter((group) => group.categories.length > 0);
};

/**
 * 선택한 분야의 질문 목록에서 앞쪽 몇 개를 예시로 보여준다.
 * "질문 직접 고르기" 모달과 같은 쿼리 키를 써서 캐시를 공유한다.
 */
const SampleQuestions = ({ category }: { category: string }): JSX.Element | null => {
  const { data: questions, isPending } = useQuery({
    queryKey: interviewQuestionKeys.byCategory(category),
    queryFn: () => getQuestions(category),
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24
  });

  // 라이브 코딩 문제는 본문이 마크다운이라 한 줄 예시로 맞지 않는다.
  const sampleQuestions = (questions ?? [])
    .filter((question) => question.question_type !== "CODE")
    .slice(0, SAMPLE_QUESTION_COUNT);

  if (!isPending && sampleQuestions.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-base font-medium text-text-secondary">
        이런 질문이 나와요
      </p>
      <ul className="flex flex-col gap-1.5">
        {isPending
          ? Array.from({ length: SAMPLE_QUESTION_COUNT }, (_, index) => (
              <Skeleton key={index} className="h-7 w-3/4 rounded-md bg-fill-tertiary" />
            ))
          : sampleQuestions.map((question) => (
              <li
                key={question.id}
                className="flex items-center gap-2.5 text-lg font-semibold text-text-primary"
              >
                <span className="size-1 shrink-0 rounded-full bg-text-primary" />
                {question.content}
              </li>
            ))}
      </ul>
    </div>
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
        const isCode = selectedQuestions.question_type === "CODE";
        createCustomInterviewMutation.mutate({
          rootQuestionId: selectedQuestions.id,
          maxQuestionCount: questionCount,
          mode: isCode ? "TEXT" : selectedInterviewType,
          questionType: selectedQuestions.question_type
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

  const groupedCategories = groupCategories(categories);
  const requiredToken =
    selectedInterviewType === "VOICE" ? questionCount * 2 : questionCount;

  return (
    <form
      className="flex w-full flex-col gap-6 lg:flex-row lg:items-stretch"
      onSubmit={handleSubmit}
    >
      <div className="flex min-w-0 flex-col gap-[30px] lg:w-[680px] lg:shrink-0">
        {/* 분야 선택 */}
        <nav className="flex flex-col gap-4" aria-label="면접 분야">
          {groupedCategories.map((group) => (
            <div key={group.title} className="flex flex-col gap-1.5">
              <p className="text-lg font-medium text-text-secondary">
                {group.title}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {group.categories.map((category) => (
                  <Chip
                    key={category.key}
                    size="large"
                    role="tab"
                    aria-selected={selectedCategory.key === category.key}
                    active={selectedCategory.key === category.key}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category.title}
                  </Chip>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* 카테고리 소개 */}
        <div className="flex flex-col gap-11 rounded-[20px] border border-border bg-bg-elevated px-6 py-8 sm:px-[30px] sm:py-10">
          <div className="flex flex-col items-center gap-5 sm:flex-row">
            <div className="flex size-[108px] shrink-0 items-end justify-center overflow-hidden rounded-[30px] bg-primary-1">
              <Image
                src={selectedCategory.image_url}
                alt={selectedCategory.title}
                width={86}
                height={105}
                priority
                className="h-[105px] w-[86px] object-contain"
              />
            </div>
            <div className="flex flex-1 flex-col gap-2.5 text-center sm:text-left">
              <h1 className="text-3xl font-bold text-text-primary">
                {selectedCategory.title}
              </h1>
              <p className="text-lg text-text-tertiary">
                {selectedCategory.description}
              </p>
            </div>
          </div>
          <SampleQuestions category={selectedCategory.key} />
        </div>
      </div>

      {/* 설정 */}
      <div className="flex flex-col justify-center gap-7 rounded-[20px] border border-border bg-fill-quaternary px-6 py-10 sm:px-[30px] lg:flex-1 lg:py-[60px]">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <p className="text-base font-medium text-text-secondary">
              출제 분야
            </p>
            <p className="text-3xl font-bold text-text-primary">
              {selectedCategory.title}
            </p>
          </div>
          <QuestionCountSelector
            questionCount={questionCount}
            handleQuestionCountChange={handleQuestionCountChange}
          />
          <InterviewTypeSelector
            selectedInterviewType={selectedInterviewType}
            handleInterviewTypeChange={handleInterviewTypeChange}
          />
        </div>
        <hr className="border-gray-3" />
        <dl className="flex flex-col gap-2 text-base font-medium text-text-secondary">
          <div className="flex justify-between">
            <dt>예상 소요</dt>
            <dd>약 {questionCount * MINUTES_PER_QUESTION}분</dd>
          </div>
          <div className="flex justify-between">
            <dt>사용 토큰</dt>
            <dd>{requiredToken}개</dd>
          </div>
        </dl>
        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            disabled={isPending}
            size={"xl"}
            className="w-full"
            variant="primary"
          >
            {isPending ? "면접 시작 중..." : "랜덤 질문으로 시작하기"}
          </Button>
          <Button
            type="button"
            variant={"secondary"}
            disabled={isPending}
            size={"xl"}
            className="w-full bg-bg-elevated"
            onClick={openQuestionListModal}
          >
            질문 직접 고르기
          </Button>
        </div>
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
        isLiveCoding={selectedQuestions?.question_type === "CODE"}
      />
    </form>
  );
};

export default CreateInterviewForm;
