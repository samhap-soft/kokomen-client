import { cva, VariantProps } from "class-variance-authority";
import React, { ButtonHTMLAttributes, JSX, RefObject } from "react";
import { cn } from "../../utils/index.ts";
import { ChevronRightIcon } from "../icon";

type TextButtonVariantsProps = VariantProps<typeof textButtonVariants>;

/**
 * Figma: Common/Button (완) — component set `Text-button` 391:477,
 * 옵션 테이블 409:502
 *
 * 배경이 없는 버튼이다. suffix icon 은 오른쪽 방향 chevron 으로 고정이고
 * prefix icon 만 자유롭게 지정한다(둘을 동시에 쓰는 것은 지양).
 *
 * size 별 실측값:
 *   small   padding 6/12  · text xs/semi-bold · icon 16
 *   default padding 8/16  · text sm/semi-bold · icon 20
 *   large   padding 12/24 · text lg/semi-bold · icon 24
 *   xl      padding 16/32 · text xl/semi-bold · icon 24
 *
 * NOTE Figma 파일에서 large 는 primary variant 만 lg/semi-bold(18px) 이고
 * 나머지 4종은 xl/semi-bold(20px) 로 들어가 있다. Button 의 large 가 18px 인
 * 점과 타입 램프(12 → 14 → 18 → 20)를 고려해 18px 로 통일했다.
 * NOTE Text-button 에는 state 프로퍼티가 없어 hover 색이 정의되어 있지 않다.
 * 클릭 가능함을 알리기 위한 최소한의 피드백으로 opacity 만 사용한다.
 */
// eslint-disable-next-line @rushstack/typedef-var
const textButtonVariants = cva(
  `inline-flex cursor-pointer items-center justify-center gap-1 whitespace-nowrap bg-transparent transition-opacity duration-200 ease-in-out hover:opacity-80 [&_svg]:pointer-events-none [&_svg]:shrink-0 disabled:pointer-events-none disabled:text-text-disabled disabled:opacity-100`,
  {
    variants: {
      variant: {
        /** onsurface/neutral */
        secondary: "text-text-primary",
        /** onsurface/neutral-subtle */
        "secondary-low": "text-text-tertiary",
        /** surface/informative */
        accent: "text-info",
        /** surface/warning */
        danger: "text-warning",
        /** surface/brand */
        primary: "text-primary"
      },
      size: {
        small: "px-3 py-1.5 text-xs font-semibold [&_svg]:size-4",
        default: "px-4 py-2 text-sm font-semibold [&_svg]:size-5",
        large: "px-6 py-3 text-lg font-semibold [&_svg]:size-6",
        xl: "px-8 py-4 text-xl font-semibold [&_svg]:size-6"
      }
    },
    defaultVariants: {
      variant: "secondary",
      size: "default"
    }
  }
);

export interface ITextButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">,
    TextButtonVariantsProps {
  children?: React.ReactNode;
  ref?: RefObject<HTMLButtonElement>;
  /** 라벨 왼쪽 아이콘. Figma 의 `prefix icon` 프로퍼티에 대응한다. */
  prefixIcon?: React.ReactNode;
}

export const TextButton = ({
  ref,
  variant,
  size,
  className,
  prefixIcon,
  children,
  ...props
}: ITextButtonProps): JSX.Element => (
  <button
    ref={ref}
    className={cn(textButtonVariants({ variant, size }), className)}
    {...props}
  >
    {prefixIcon}
    {children}
    <ChevronRightIcon />
  </button>
);
