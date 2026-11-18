import { JSX } from "react";
import { cn } from "../../../../utils";

export interface InterviewerPickerOption {
  id: string;
  /** 어떤 면접관인지. 예: "시니어 테크 리드" */
  name: string;
  posterUrl: string;
}

export interface InterviewerPickerProps {
  options: InterviewerPickerOption[];
  selectedId: string;
  // eslint-disable-next-line no-unused-vars
  onSelect: (id: string) => void;
}

/**
 * 입장 화면의 면접관 선택. 사진과 이름만 있는 카드를 라디오 그룹으로 고른다.
 * 선택한 카드는 테두리만 진하게 바꾼다. 2열(넓은 화면 4열)이다. Figma 시안은 없다.
 */
export function InterviewerPicker({
  options,
  selectedId,
  onSelect
}: InterviewerPickerProps): JSX.Element {
  return (
    <div className="flex flex-col gap-2">
      <p id="interviewer-picker-label" className="text-sm font-medium text-text-secondary">
        면접관
      </p>
      <div
        role="radiogroup"
        aria-labelledby="interviewer-picker-label"
        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
      >
        {options.map((option) => {
          const isSelected = option.id === selectedId;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(option.id)}
              className={cn(
                "flex flex-col overflow-hidden rounded-lg border bg-bg-base text-left transition-colors",
                isSelected
                  ? "border-text-primary"
                  : "border-border hover:border-text-quaternary"
              )}
            >
              <img
                src={option.posterUrl}
                alt=""
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
              <span
                className={cn(
                  "truncate px-2 py-1.5 text-xs",
                  isSelected
                    ? "font-semibold text-text-primary"
                    : "text-text-secondary"
                )}
              >
                {option.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
