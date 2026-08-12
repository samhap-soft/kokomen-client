import { JSX } from "react";
import { Button } from "@kokomen/ui";
import { Check, Lightbulb } from "lucide-react";

interface OnboardingCompleteProps {
  onStart: () => void;
  isPending: boolean;
}

export default function OnboardingComplete({
  onStart,
  isPending
}: OnboardingCompleteProps): JSX.Element {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary">
        <Check className="!size-8 text-primary" aria-hidden="true" />
      </div>
      <h1 className="mt-6 text-xl font-bold text-text-heading">
        모든 설정이 완료되었어요!
      </h1>
      <p className="mt-2 text-sm text-text-description leading-relaxed break-keep">
        입력해주신 정보를 바탕으로
        <br />
        맞춤형 AI 면접과 피드백을 제공할게요.
      </p>

      <div className="mt-6 flex w-full items-start gap-2 rounded-xl bg-fill-quaternary p-4 text-left">
        <Lightbulb
          className="!size-4 shrink-0 text-text-tertiary"
          aria-hidden="true"
        />
        <p className="text-xs text-text-description break-keep">
          언제든지 [마이페이지 &gt; 설정]에서 정보를 수정할 수 있어요.
        </p>
      </div>

      <Button
        type="button"
        variant="primary"
        className="mt-8 w-full py-3.5 text-base font-bold"
        onClick={onStart}
        disabled={isPending}
        aria-disabled={isPending}
        pendingSpinner={isPending}
        pendingText="이동중.."
      >
        꼬꼬면 시작하기
      </Button>
    </div>
  );
}
