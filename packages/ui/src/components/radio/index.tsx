import { cva } from "class-variance-authority";
import React, { createContext, useContext, useId } from "react";
import { cn } from "../../utils/index.ts";

// Radio 컨텍스트 타입
interface RadioContextValue {
  value?: string;
  onChange?: (value: string) => void;
  name: string;
  disabled?: boolean;
  size?: "small" | "medium" | "large";
  variant?: "primary" | "success" | "warning" | "error";
}

// Radio 컨텍스트 생성
const RadioContext = createContext<RadioContextValue | undefined>(undefined);

/**
 * Figma: Common/Radio (완) — component set 55:89
 *
 * size(small · medium · large) x checked(false · true) x state(default · disabled).
 * Figma 에는 variant 프로퍼티가 없고 체크 색은 항상 surface/brand-fill 이다.
 *
 *   small  circle 16 · label sm(14/20)
 *   medium circle 20 · label base(16/24)
 *   large  circle 24 · label lg(18/28)
 *
 * unchecked 는 투명 배경 + 2px stroke/primary-light 테두리,
 * checked 는 테두리 없이 surface/brand-fill 로 원을 채운다(내부 점 없음).
 * disabled 은 surface/neutral-container-disabled 로 채우고 라벨을
 * onsurface/neutral-disabled 로 바꾼다 — opacity 는 쓰지 않는다.
 */
const radioVariants = cva(
  `
  relative inline-flex shrink-0 items-center justify-center rounded-full
  transition-colors duration-200 ease-in-out cursor-pointer
  focus:outline-none
  `,
  {
    variants: {
      size: {
        small: "size-4",
        medium: "size-5",
        large: "size-6"
      },
      checked: {
        true: "",
        false: "border-2 border-primary-2 bg-transparent"
      },
      disabled: {
        true: "cursor-not-allowed border-transparent bg-bg-container-disabled",
        false: ""
      }
    },
    defaultVariants: {
      size: "medium",
      checked: false,
      disabled: false
    },
    compoundVariants: [
      {
        checked: true,
        disabled: false,
        className: "bg-primary-bg"
      }
    ]
  }
);

// Label 스타일
const labelVariants = cva(
  `
  cursor-pointer select-none
  transition-colors duration-200 ease-in-out
  `,
  {
    variants: {
      size: {
        small: "text-sm",
        medium: "text-base",
        large: "text-lg"
      }
    },
    defaultVariants: {
      size: "medium"
    }
  }
);

// RadioGroup Props
export interface RadioGroupProps {
  children: React.ReactNode;
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
  size?: "small" | "medium" | "large";
  variant?: "primary" | "success" | "warning" | "error";
  className?: string;
  "aria-label"?: string;
}

// Radio Props
export interface RadioProps {
  value: string;
  children?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
}

/**
 * Figma 는 체크 색으로 surface/brand-fill 만 정의한다. success / warning / error
 * 는 Figma 명세에 없는 코드 전용 확장이라 대응 토큰으로만 이어둔다.
 */
const checkedFillByVariant = {
  primary: "bg-primary-bg",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error"
} as const;

// RadioGroup 컴포넌트
export const RadioGroup = ({
  children,
  value,
  onChange,
  name: propName,
  disabled = false,
  size = "medium",
  variant = "primary",
  className,
  "aria-label": ariaLabel,
}: RadioGroupProps) => {
  const generatedName = useId();
  const name = propName || generatedName;

  const contextValue: RadioContextValue = {
    value,
    onChange,
    name,
    disabled,
    size,
    variant,
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      // 다음 라디오 버튼으로 포커스 이동
      const radioButtons = Array.from(
        document.querySelectorAll(`input[name="${name}"]`)
      ) as HTMLInputElement[];
      const currentIndex = radioButtons.findIndex(
        (radio) => radio === document.activeElement
      );
      const nextIndex = (currentIndex + 1) % radioButtons.length;
      radioButtons[nextIndex]?.focus();
      onChange?.(radioButtons[nextIndex].value);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      // 이전 라디오 버튼으로 포커스 이동
      const radioButtons = Array.from(
        document.querySelectorAll(`input[name="${name}"]`)
      ) as HTMLInputElement[];
      const currentIndex = radioButtons.findIndex(
        (radio) => radio === document.activeElement
      );
      const prevIndex =
        currentIndex === 0 ? radioButtons.length - 1 : currentIndex - 1;
      radioButtons[prevIndex]?.focus();
      onChange?.(radioButtons[prevIndex].value);
    }
  };

  return (
    <RadioContext.Provider value={contextValue}>
      <div
        className={cn("flex gap-4 items-center", className)}
        role="radiogroup"
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </RadioContext.Provider>
  );
};

// Radio 컴포넌트
export const Radio = ({
  value,
  children,
  disabled: propDisabled = false,
  className,
  id: propId,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
}: RadioProps) => {
  const context = useContext(RadioContext);
  const generatedId = useId();
  const id = propId || generatedId;

  if (!context) {
    throw new Error("Radio must be used within a RadioGroup");
  }

  const {
    value: groupValue,
    onChange,
    name,
    disabled: groupDisabled,
    size,
    variant,
  } = context;

  const isDisabled = groupDisabled || propDisabled;
  const isChecked = groupValue === value;

  const handleChange = () => {
    if (!isDisabled && onChange) {
      onChange(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      handleChange();
    }
  };

  return (
    <label
      htmlFor={id}
      className={cn(
        "flex items-center gap-2",
        labelVariants({ size }),
        isDisabled && "cursor-not-allowed",
        className
      )}
    >
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={isChecked}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={isDisabled}
        className="sr-only"
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
      />
      <span
        aria-hidden
        className={cn(
          radioVariants({ size, checked: isChecked, disabled: isDisabled }),
          isChecked && !isDisabled && checkedFillByVariant[variant ?? "primary"]
        )}
      />
      {children && (
        <span
          className={cn(
            "text-text-primary",
            isDisabled && "text-text-disabled"
          )}
        >
          {children}
        </span>
      )}
    </label>
  );
};

// 기본 export
export { RadioGroup as default };
