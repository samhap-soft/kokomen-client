import { JSX } from "react";
import { Check } from "lucide-react";

interface OnboardingStepIndicatorProps {
  totalSteps: number;
  /** 현재 스텝 인덱스 (0부터 시작) */
  currentStep: number;
}

export default function OnboardingStepIndicator({
  totalSteps,
  currentStep
}: OnboardingStepIndicatorProps): JSX.Element {
  return (
    <div
      className="flex items-center justify-center"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-valuenow={currentStep + 1}
      aria-label={`${totalSteps}단계 중 ${currentStep + 1}단계`}
    >
      {Array.from({ length: totalSteps }, (_, index) => {
        const isDone: boolean = index < currentStep;
        const isCurrent: boolean = index === currentStep;
        return (
          <div key={index} className="flex items-center">
            {index > 0 && (
              <span
                aria-hidden="true"
                className={`h-px w-3 ${isDone || isCurrent ? "bg-primary" : "bg-border-secondary"}`}
              />
            )}
            <span
              aria-hidden="true"
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
                isDone || isCurrent
                  ? "bg-primary text-text-light-solid"
                  : "border border-border-secondary text-text-quaternary"
              }`}
            >
              {isDone ? <Check className="!size-3.5" /> : index + 1}
            </span>
          </div>
        );
      })}
    </div>
  );
}
