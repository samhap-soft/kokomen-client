import { JSX } from "react";

interface OnboardingProgressBarProps {
  totalSteps: number;
  /** 현재 스텝 인덱스 (0부터 시작) */
  currentStep: number;
}

export default function OnboardingProgressBar({
  totalSteps,
  currentStep
}: OnboardingProgressBarProps): JSX.Element {
  const isLastStep: boolean = currentStep === totalSteps - 1;
  const percent: number = Math.round(((currentStep + 1) / totalSteps) * 100);

  return (
    <div>
      <div className="flex items-end justify-between">
        <span className="text-xs font-medium text-text-description">
          {isLastStep
            ? "마지막 단계!"
            : `${currentStep + 1}/${totalSteps} 단계`}
        </span>
        <span className="text-xs font-semibold text-text-secondary tabular-nums">
          {percent}% 완료
        </span>
      </div>
      <div
        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-fill-secondary"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label="온보딩 진행률"
      >
        <div
          className="h-full rounded-full bg-primary transition-all duration-300 ease-in-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
