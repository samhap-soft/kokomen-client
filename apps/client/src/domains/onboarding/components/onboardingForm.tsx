import { JSX, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useMutation } from "@tanstack/react-query";
import { Button, RoundSpinner, useToast } from "@kokomen/ui";
import {
  CareerGoal,
  InterviewExperience,
  OnboardingSurveyPayload,
  PrepStage,
  TargetCompanyType,
  TechTopic,
  WeakPoint
} from "@kokomen/types";
import { AxiosError } from "axios";
import { useScreenSize } from "@/hooks/useScreenSize";
import { submitOnboardingSurvey } from "@/domains/onboarding/api";
import { markOnboardingSubmitted } from "@/domains/onboarding/utils";
import {
  DESKTOP_STEPS,
  MOBILE_STEPS,
  ONBOARDING_QUESTIONS,
  OnboardingQuestionKey,
  QUESTION_BY_KEY
} from "@/domains/onboarding/constants";
import OnboardingQuestionCard from "@/domains/onboarding/components/onboardingQuestionCard";
import OnboardingStepIndicator from "@/domains/onboarding/components/onboardingStepIndicator";
import OnboardingProgressBar from "@/domains/onboarding/components/onboardingProgressBar";
import OnboardingComplete from "@/domains/onboarding/components/onboardingComplete";

type AnswerState = Record<OnboardingQuestionKey, string | string[]>;

const INITIAL_ANSWERS: AnswerState = {
  career_goal: "",
  prep_stages: [],
  tech_topics: [],
  target_company_type: "",
  interview_experience: "",
  weak_points: []
};

function isAnswered(answers: AnswerState, key: OnboardingQuestionKey): boolean {
  const value = answers[key];
  return Array.isArray(value) ? value.length > 0 : value !== "";
}

function toPayload(answers: AnswerState): OnboardingSurveyPayload {
  return {
    career_goal: answers.career_goal as CareerGoal,
    prep_stages: answers.prep_stages as PrepStage[],
    tech_topics: answers.tech_topics as TechTopic[],
    target_company_type: answers.target_company_type as TargetCompanyType,
    interview_experience: answers.interview_experience as InterviewExperience,
    weak_points: answers.weak_points as WeakPoint[]
  };
}

export default function OnboardingForm({
  redirectTo
}: {
  redirectTo: string;
}): JSX.Element {
  const router = useRouter();
  const { error: errorToast } = useToast();
  const { isMobile } = useScreenSize();
  // useScreenSize는 마운트 이후에 화면 크기를 알 수 있어서, 그 전에는 스텝 구성을 확정할 수 없다.
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [answers, setAnswers] = useState<AnswerState>(INITIAL_ANSWERS);
  // 스텝 구성이 화면 크기에 따라 달라지므로, 위치는 문항 기준으로 기억한다.
  const [activeQuestionKey, setActiveQuestionKey] =
    useState<OnboardingQuestionKey>(ONBOARDING_QUESTIONS[0].key);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { mutate: submitOnboarding, isPending } = useMutation({
    mutationFn: submitOnboardingSurvey,
    onSuccess: () => {
      markOnboardingSubmitted();
      setIsCompleted(true);
    },
    onError: (error: AxiosError) => {
      errorToast({
        title: "온보딩 정보 저장에 실패했습니다.",
        description:
          (error.response?.data as { message?: string })?.message ??
          "잠시 후 다시 시도해주세요."
      });
    }
  });

  const steps: OnboardingQuestionKey[][] = isMobile
    ? MOBILE_STEPS
    : DESKTOP_STEPS;
  const currentStep: number = Math.max(
    steps.findIndex((group) => group.includes(activeQuestionKey)),
    0
  );
  const currentKeys: OnboardingQuestionKey[] = steps[currentStep];
  const isFirstStep: boolean = currentStep === 0;
  const isLastStep: boolean = currentStep === steps.length - 1;
  const isCurrentStepAnswered: boolean = currentKeys.every((key) =>
    isAnswered(answers, key)
  );

  const handleChange = (
    key: OnboardingQuestionKey,
    nextValue: string | string[]
  ): void => {
    setAnswers((previous) => ({ ...previous, [key]: nextValue }));
  };

  const goToStep = (stepIndex: number): void => {
    setActiveQuestionKey(steps[stepIndex][0]);
  };

  const handleNext = (): void => {
    if (!isCurrentStepAnswered || isPending) return;
    if (isLastStep) {
      submitOnboarding(toPayload(answers));
      return;
    }
    goToStep(currentStep + 1);
  };

  const handlePrevious = (): void => {
    if (isFirstStep) return;
    goToStep(currentStep - 1);
  };

  const handleStart = (): void => {
    router.replace(redirectTo || "/");
  };

  if (!isMounted) {
    return (
      <div className="flex min-h-[420px] w-full max-w-3xl items-center justify-center rounded-2xl border border-border bg-bg-base">
        <RoundSpinner />
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-border bg-bg-base p-6 shadow-sm sm:p-8">
        <OnboardingComplete onStart={handleStart} isPending={false} />
      </div>
    );
  }

  return (
    <div
      className={`w-full rounded-2xl border border-border bg-bg-base p-5 shadow-sm sm:p-8 ${
        isMobile ? "max-w-md" : "max-w-3xl"
      }`}
    >
      {isMobile ? (
        <OnboardingStepIndicator
          totalSteps={steps.length}
          currentStep={currentStep}
        />
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <span className="text-base font-bold text-text-heading">
              꼬꼬면
            </span>
            <span className="text-xs text-text-tertiary">
              맞춤 면접을 위한 기본 정보
            </span>
          </div>
          <OnboardingProgressBar
            totalSteps={steps.length}
            currentStep={currentStep}
          />
        </>
      )}

      <div className={isMobile ? "mt-6" : "mt-8 flex flex-col gap-8"}>
        {currentKeys.map((key) => (
          <OnboardingQuestionCard
            key={key}
            question={QUESTION_BY_KEY[key]}
            order={
              ONBOARDING_QUESTIONS.findIndex(
                (question) => question.key === key
              ) + 1
            }
            value={answers[key]}
            onChange={(nextValue) => handleChange(key, nextValue)}
            layout={isMobile ? "mobile" : "desktop"}
          />
        ))}
      </div>

      <div
        className={`mt-8 flex items-center gap-3 ${
          isFirstStep ? "justify-end" : "justify-between"
        }`}
      >
        {!isFirstStep && (
          <Button
            type="button"
            variant="cancel"
            className="px-6 py-3 text-sm font-semibold"
            onClick={handlePrevious}
            disabled={isPending}
          >
            이전
          </Button>
        )}
        <Button
          type="button"
          variant="primary"
          className={`py-3 text-sm font-bold ${isMobile ? "flex-1" : "px-6"}`}
          onClick={handleNext}
          disabled={!isCurrentStepAnswered || isPending}
          aria-disabled={!isCurrentStepAnswered || isPending}
          pendingSpinner={isPending}
          pendingText="저장중.."
          data-testid="onboarding-next-button"
        >
          {isLastStep
            ? "맞춤 면접 시작하기 🚀"
            : `다음 단계 (${currentStep + 1}/${steps.length})`}
        </Button>
      </div>
    </div>
  );
}
