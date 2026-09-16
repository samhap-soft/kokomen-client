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
        /** surface/brand-fill → hovered, 글자·아이콘은 onsurface/neutral */
        primary:
          "bg-primary-bg text-text-primary hover:bg-primary-bg-hover [&_svg]:text-text-primary",
        /** gray/100 + 1px stroke/default, hover 에서 gray/200 · 테두리 제거 */
        secondary:
          "bg-gray-1 text-text-primary border border-border hover:bg-gray-2 hover:border-transparent",
        /** surface/warning → hovered, 글자·아이콘은 onsurface/neutral-inverse */
        danger:
          "bg-warning text-text-light-solid hover:bg-warning-hover [&_svg]:text-text-light-solid",
        /** surface/brand-weak → hovered, 글자·아이콘은 surface/brand */
        "primary-soft":
          "bg-primary-bg-light text-primary hover:bg-primary-bg-light-hover [&_svg]:text-primary",
        /**
         * 스타일 variant 가 아니라 opt-out 이다. Figma 옵션 테이블에는 없지만,
         * 헤더 드롭다운 항목이나 사이드바 내비게이션처럼 `button` 시맨틱만
         * 필요하고 모양은 className 으로 직접 그리는 자리에서 사용한다.
         */
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
      /**
       * 낙관적 업데이트 중(=`disabled`)에도 비활성 회색이 아니라 활성 상태처럼
       * 보이게 하는 모디파이어. Figma 명세에는 없다.
       */
      optimistic: {
        true: "disabled:!bg-volcano-3 disabled:!text-volcano-6",
        false: ""
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      round: false,
      optimistic: false
    }
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
