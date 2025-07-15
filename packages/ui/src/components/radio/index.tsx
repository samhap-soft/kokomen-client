import { cva, VariantProps } from "class-variance-authority";
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

// Radio 스타일 variants 정의
const radioVariants = cva(
  `
  relative inline-flex items-center justify-center rounded-full border-2 
  transition-all duration-200 ease-in-out cursor-pointer
  focus:outline-none focus:ring-2 focus:ring-offset-2
  disabled:cursor-not-allowed disabled:opacity-50
  `,
  {
    variants: {
      variant: {
        primary: `
          border-border text-primary
          hover:border-primary-border-hover
          focus:border-primary-border focus:ring-primary-bg
          checked:border-primary checked:bg-primary
          checked:hover:border-primary-hover checked:hover:bg-primary-hover
          checked:active:border-primary-active checked:active:bg-primary-active
        `,
        success: `
          border-border text-success
          hover:border-success-border-hover
          focus:border-success-border focus:ring-success-bg
          checked:border-success checked:bg-success
          checked:hover:border-success-hover checked:hover:bg-success-hover
          checked:active:border-success-active checked:active:bg-success-active
        `,
        warning: `
          border-border text-warning
          hover:border-warning-border-hover
          focus:border-warning-border focus:ring-warning-bg
          checked:border-warning checked:bg-warning
          checked:hover:border-warning-hover checked:hover:bg-warning-hover
          checked:active:border-warning-active checked:active:bg-warning-active
        `,
        error: `
          border-border text-error
          hover:border-error-border-hover
          focus:border-error-border focus:ring-error-bg
          checked:border-error checked:bg-error
          checked:hover:border-error-hover checked:hover:bg-error-hover
          checked:active:border-error-active checked:active:bg-error-active
        `,
      },
      size: {
        small: "w-4 h-4",
        medium: "w-5 h-5",
        large: "w-6 h-6",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "medium",
    },
  }
);

// Radio 내부 점 스타일
const radioInnerVariants = cva(
  `
  absolute rounded-full bg-text-light-solid
  transition-all duration-200 ease-in-out
  `,
  {
    variants: {
      size: {
        small: "w-1.5 h-1.5",
        medium: "w-2 h-2",
        large: "w-2.5 h-2.5",
      },
    },
    defaultVariants: {
      size: "medium",
    },
  }
);

// Label 스타일
const labelVariants = cva(
  `
  ml-2 cursor-pointer select-none
  transition-colors duration-200 ease-in-out
  disabled:cursor-not-allowed disabled:opacity-50
  `,
  {
    variants: {
      size: {
        small: "text-sm",
        medium: "text-base",
        large: "text-lg",
      },
    },
    defaultVariants: {
      size: "medium",
    },
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
export interface RadioProps extends VariantProps<typeof radioVariants> {
  value: string;
  children?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
}

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
        "flex items-center",
        labelVariants({ size }),
        isDisabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <div className="relative flex items-center justify-center gap-2">
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
        <div
          className={cn(
            radioVariants({ variant, size }),
            isChecked && "border-opacity-100",
            isDisabled && "opacity-50"
          )}
          style={{
            backgroundColor: isChecked
              ? `var(--color-${variant})`
              : "transparent",
            borderColor: isChecked
              ? `var(--color-${variant})`
              : `var(--color-border)`,
          }}
        >
          {isChecked && (
            <div
              className={cn(radioInnerVariants({ size }))}
              style={{
                backgroundColor: "var(--color-text-light-solid)",
              }}
            />
          )}
        </div>
      </div>
      {children && (
        <span
          className={cn(
            "text-text-primary ml-2",
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
