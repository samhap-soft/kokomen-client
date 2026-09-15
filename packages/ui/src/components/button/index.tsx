import { cva, VariantProps } from "class-variance-authority";
import React, { ButtonHTMLAttributes, JSX, RefObject } from "react";
import { cn } from "../../utils/index.ts";
import { RoundSpinner } from "../spinner";

type ButtonVariantsProps = VariantProps<typeof buttonVariants>;

/**
 * Figma: Common/Button (완) — component set 51:46, 옵션 테이블 409:502
 *
 * 명세된 속성은 variant(primary · secondary · danger · primary-soft) x
 * size(default · small · large · xl) x state(default · hover · disabled) 이며,
 * danger 에는 disabled 상태가 정의되어 있지 않다(그래도 접근성상 동일한
 * disabled 토큰을 적용한다).
 *
 * size 별 실측값:
 *   small   padding 6/12  · text xs/medium     · icon 16 · radius 12
 *   default padding 8/16  · text sm/medium     · icon 20 · radius 12
 *   large   padding 12/20 · text lg/semi-bold  · icon 24 · radius 12
 *   xl      padding 16/24 · text xl/semi-bold  · icon 24 · radius 12
 * gap 은 모든 size 에서 4px 이다.
 */
// eslint-disable-next-line @rushstack/typedef-var
const buttonVariants = cva(
  `inline-flex cursor-pointer items-center justify-center gap-1 whitespace-nowrap text-center transition-colors duration-200 ease-in-out [&_svg]:pointer-events-none [&_svg]:shrink-0 disabled:pointer-events-none disabled:bg-bg-container-disabled disabled:text-text-disabled disabled:border-transparent disabled:shadow-none`,
  {
    variants: {
      variant: {
        /* ── Figma 명세 variant ─────────────────────────────────────────── */
        primary:
          "bg-primary-bg text-text-primary hover:bg-primary-bg-hover [&_svg]:text-text-primary",
        secondary:
          "bg-gray-1 text-text-primary border border-border hover:bg-gray-2 hover:border-transparent",
        danger:
          "bg-warning text-text-light-solid hover:bg-warning-hover [&_svg]:text-text-light-solid",
        "primary-soft":
          "bg-primary-bg-light text-primary hover:bg-primary-bg-light-hover [&_svg]:text-primary",

        /* ── Legacy variant ─────────────────────────────────────────────────
           Figma 옵션 테이블에는 없는 값들이다. 기존 호출부를 깨지 않기 위해
           남겨두었고, `soft` / `cancel` / `default` / `warning` 은 대응되는
           Figma variant 와 동일한 스타일을 쓴다. 나머지는 디자인 확정 후
           위 4종으로 정리해야 한다. */
        /** @deprecated Figma `primary-soft` 를 사용한다. */
        soft: "bg-primary-bg-light text-primary hover:bg-primary-bg-light-hover [&_svg]:text-primary",
        /** @deprecated Figma `secondary` 를 사용한다. */
        cancel:
          "bg-gray-1 text-text-primary border border-border hover:bg-gray-2 hover:border-transparent",
        /** @deprecated Figma `secondary` 를 사용한다. */
        default:
          "bg-gray-1 text-text-primary border border-border hover:bg-gray-2 hover:border-transparent",
        /** @deprecated Figma `danger` 를 사용한다. */
        warning:
          "bg-warning text-text-light-solid hover:bg-warning-hover [&_svg]:text-text-light-solid",
        /** @deprecated Figma 명세에 없다. */
        dashed:
          "text-primary-text outline-border-secondary hover:outline-primary-border-hover focus:outline-primary outline-dashed outline-2 hover:text-primary-hover bg-transparent",
        /** @deprecated Figma 명세에 없다. TextButton 으로 대체를 검토한다. */
        text: "text-text-primary hover:bg-bg-text-hover active:bg-bg-text-active bg-transparent",
        /** @deprecated Figma 명세에 없다. TextButton 으로 대체를 검토한다. */
        link: "text-primary hover:text-primary-hover underline-offset-4 hover:underline bg-transparent",
        /** @deprecated Figma 명세에 없다. */
        success:
          "bg-success hover:bg-success-hover active:bg-success-active text-text-light-solid",
        /** @deprecated Figma 명세에 없다. */
        info: "bg-info hover:bg-info-hover active:bg-info-active text-text-light-solid",
        /** @deprecated Figma 명세에 없다. */
        submit: "bg-blue-5 text-text-light-solid active:bg-blue-6",
        /** @deprecated Figma 명세에 없다. */
        gradient:
          "bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary-active text-text-light-solid",
        /** @deprecated Figma 명세에 없다. */
        gradientSuccess:
          "bg-gradient-to-r from-success to-success-hover hover:from-success-hover hover:to-success-active text-text-light-solid",
        /** @deprecated Figma 명세에 없다. */
        gradientPurple:
          "bg-gradient-to-r from-purple-5 to-purple-6 hover:from-purple-6 hover:to-purple-7 text-text-light-solid",
        /** @deprecated Figma 명세에 없다. */
        outline:
          "bg-transparent text-text-primary border-2 border-border hover:bg-primary hover:text-text-primary active:bg-primary-active",
        /** @deprecated Figma 명세에 없다. */
        outlineSuccess:
          "bg-transparent text-success border-2 border-success hover:bg-success hover:text-text-light-solid active:bg-success-active",
        /** @deprecated Figma 명세에 없다. */
        outlineWarning:
          "bg-transparent text-warning border-2 border-warning hover:bg-warning hover:text-text-light-solid active:bg-warning-hover",
        /** @deprecated Figma 명세에 없다. */
        softSuccess:
          "bg-success-bg text-success hover:bg-success-bg-hover active:bg-success-border",
        /** @deprecated Figma 명세에 없다. */
        softWarning:
          "bg-warning-bg text-warning hover:bg-warning-bg-hover active:bg-warning-border",
        /** @deprecated Figma 명세에 없다. */
        glass:
          "bg-base-white/20 backdrop-blur-md border border-base-white/30 text-text-primary hover:bg-base-white/30 hover:border-base-white/50",
        none: ""
      },
      size: {
        small: "px-3 py-1.5 text-xs font-medium [&_svg]:size-4",
        default: "px-4 py-2 text-sm font-medium [&_svg]:size-5",
        large: "px-5 py-3 text-lg font-semibold [&_svg]:size-6",
        xl: "px-6 py-4 text-xl font-semibold [&_svg]:size-6"
      },
      round: {
        true: "rounded-full",
        false: "rounded-xl"
      },
      optimistic: {
        true: "",
        false: ""
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      round: false
    },
    compoundVariants: [
      {
        variant: "glass",
        optimistic: true,
        className:
          "disabled:!bg-volcano-3 disabled:!text-volcano-6 disabled:!opacity-100"
      }
    ]
  }
);

export interface IButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">,
    ButtonVariantsProps {
  children?: React.ReactNode;
  ref?: RefObject<HTMLButtonElement>;
  /**
   * 라벨 왼쪽 아이콘. Figma 의 `prefix icon` 프로퍼티에 대응한다.
   * suffix icon 과 동시에 쓰는 것은 디자인 가이드에서 지양한다.
   */
  prefixIcon?: React.ReactNode;
  /** 라벨 오른쪽 아이콘. Figma 의 `suffix icon` 프로퍼티에 대응한다. */
  suffixIcon?: React.ReactNode;
  pendingText?: string;
  pendingSpinner?: boolean;
}

export const Button = ({
  ref,
  variant,
  className,
  size,
  round = false,
  optimistic = false,
  pendingSpinner = false,
  pendingText,
  prefixIcon,
  suffixIcon,
  children,
  ...props
}: IButtonProps): JSX.Element => (
  <button
    ref={ref}
    className={cn(
      buttonVariants({
        variant,
        size,
        round,
        optimistic
      }),
      className
    )}
    {...props}
  >
    {props.disabled && pendingSpinner ? (
      <>
        <RoundSpinner />
        <span className="text-text-secondary">{pendingText ?? "제출중.."}</span>
      </>
    ) : (
      <>
        {prefixIcon}
        {children}
        {suffixIcon}
      </>
    )}
  </button>
);
