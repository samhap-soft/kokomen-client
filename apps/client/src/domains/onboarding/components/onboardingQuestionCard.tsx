import { JSX } from "react";
import { Button } from "@kokomen/ui";
import { Check } from "lucide-react";
import { OnboardingQuestion } from "@/domains/onboarding/constants";

const DESKTOP_GRID_CLASS: Record<2 | 3, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3"
};

interface OnboardingQuestionCardProps {
  question: OnboardingQuestion;
  /** 전체 문항 중 몇 번째 문항인지 (1부터 시작) */
  order: number;
  value: string | string[];
  // eslint-disable-next-line no-unused-vars
  onChange: (nextValue: string | string[]) => void;
  layout: "mobile" | "desktop";
}

function isSelected(value: string | string[], optionValue: string): boolean {
  return Array.isArray(value)
    ? value.includes(optionValue)
    : value === optionValue;
}

function getNextValue(
  question: OnboardingQuestion,
  value: string | string[],
  optionValue: string
): string | string[] {
  if (question.type === "single") {
    return optionValue;
  }
  const selected = Array.isArray(value) ? value : [];
  return selected.includes(optionValue)
    ? selected.filter((item) => item !== optionValue)
    : [...selected, optionValue];
}

export default function OnboardingQuestionCard({
  question,
  order,
  value,
  onChange,
  layout
}: OnboardingQuestionCardProps): JSX.Element {
  const isMobile: boolean = layout === "mobile";

  return (
    <section aria-labelledby={`onboarding-question-${question.key}`}>
      <h2
        id={`onboarding-question-${question.key}`}
        className={
          isMobile
            ? "text-lg font-bold text-text-heading leading-snug"
            : "text-base font-bold text-text-heading leading-snug"
        }
      >
        {isMobile ? question.title : `${order}. ${question.title}`}
        {question.type === "multiple" && (
          <span className="ml-1.5 text-xs font-medium text-text-tertiary">
            (복수 선택 가능)
          </span>
        )}
      </h2>
      <p className="mt-1.5 text-xs text-text-description">
        {question.description}
      </p>

      <div
        role={question.type === "single" ? "radiogroup" : "group"}
        aria-label={question.title}
        className={
          isMobile
            ? "mt-4 flex flex-col gap-2"
            : `mt-4 grid grid-cols-1 gap-2 ${DESKTOP_GRID_CLASS[question.desktopColumns]}`
        }
      >
        {question.options.map((option) => {
          const selected: boolean = isSelected(value, option.value);
          return (
            <Button
              key={option.value}
              type="button"
              variant={selected ? "primary" : "default"}
              role={question.type === "single" ? "radio" : "checkbox"}
              aria-checked={selected}
              aria-selected={selected}
              data-testid={`onboarding-option-${question.key}-${option.value}`}
              onClick={() =>
                onChange(getNextValue(question, value, option.value))
              }
              className={
                isMobile
                  ? "w-full justify-start gap-3 px-4 py-3.5 text-sm font-medium"
                  : "w-full justify-center gap-2 px-4 py-3.5 text-sm font-medium text-center"
              }
            >
              {isMobile && (
                <span
                  aria-hidden="true"
                  className={`flex h-4 w-4 shrink-0 items-center justify-center border-2 ${
                    question.type === "single" ? "rounded-full" : "rounded-sm"
                  } ${
                    selected
                      ? "border-text-light-solid"
                      : "border-border-secondary"
                  }`}
                >
                  {selected && (
                    <span className="h-1.5 w-1.5 rounded-full bg-text-light-solid" />
                  )}
                </span>
              )}
              {!isMobile && selected && (
                <Check aria-hidden="true" className="!size-4 shrink-0" />
              )}
              {option.emoji && <span aria-hidden="true">{option.emoji}</span>}
              <span className="whitespace-normal break-keep text-left">
                {option.label}
              </span>
            </Button>
          );
        })}
      </div>
    </section>
  );
}
