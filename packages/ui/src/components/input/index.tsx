import { cn } from "../../utils/index.ts";
import { cva, VariantProps } from "class-variance-authority";
import React from "react";

type InputVariantProps = VariantProps<typeof inputVariants>;

/**
 * Figma: Common/Input (완) — component set 54:51
 *
 * variant(default · red) x size(default · lg · xl · 2xl) x
 * state(default · hover · filled · disabled).
 *
 * 공통: padding 8, radius 6, border 2px, 배경은 surface/neutral.
 * default variant 의 테두리는 stroke/brand → hover/focus 에서 surface/brand,
 * red variant 는 stroke/error → hover/focus 에서 stroke/error-hovered 로 간다.
 * disabled 은 배경 surface/neutral-container-disabled + 글자 neutral-disabled 이며
 * 불투명한 토큰 색을 그대로 쓰기 때문에 opacity 를 따로 걸지 않는다.
 */
const inputVariants = cva(
  "flex items-center rounded-md p-2 border-2 bg-bg-base text-text-primary transition-colors disabled:bg-bg-container-disabled disabled:text-text-disabled",
  {
    variants: {
      variant: {
        default:
          "border-primary-border placeholder:text-text-quaternary hover:border-primary focus:border-primary disabled:border-border-secondary",
        red: "border-error-border placeholder:text-text-secondary hover:border-error-border-hover focus:border-error-border-hover disabled:border-error-border",
        /** @deprecated Figma 명세에 없다. `default` 를 사용한다. */
        outline:
          "border-border placeholder:text-text-quaternary hover:border-primary focus:border-primary disabled:border-border-secondary"
      },
      size: {
        default: "text-base",
        lg: "text-lg",
        xl: "text-xl",
        "2xl": "text-2xl",
        /** @deprecated Figma 명세에 없다. */
        sm: "text-sm"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

interface InputProps
  extends Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      "size" | "children" | "dangerouslySetInnerHTML"
    >,
    InputVariantProps {
  ref?: React.Ref<HTMLInputElement>;
  children?: React.ReactNode;
  name?: string; // optional로 변경
}
export const Input = ({
  variant,
  type,
  className,
  size,
  ref,
  name,
  ...props
}: InputProps) => (
  <input
    dangerouslySetInnerHTML={undefined}
    ref={ref}
    type={type}
    name={name}
    className={cn(inputVariants({ variant, size }), className)}
    id={name}
    {...props}
  />
);
