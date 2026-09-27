import { cva, VariantProps } from "class-variance-authority";
import React, { ButtonHTMLAttributes, JSX, RefObject } from "react";
import { cn } from "../../utils/index.ts";

type ChipVariantsProps = VariantProps<typeof chipVariants>;

/**
 * Figma: Common/Chip — component set 565:505
 *
 * 명세된 속성은 size(small · default · large · xl) x style(active · inactive)
 * 이고, 라벨 외의 슬롯(아이콘)이나 hover · disabled 상태는 정의되어 있지 않다.
 * Figma 의 `style` 은 선택 여부를 뜻하므로 여기서는 `active` boolean 으로
 * 노출한다(React 의 `style` prop 과 겹치기 때문).
 *
 * size 별 실측값:
 *   small   padding 4/12 · text xs(12/16) medium     · height 24
 *   default padding 8/16 · text sm(14/20) medium     · height 36
 *   large   padding 8/20 · text lg(18/28) semi-bold  · height 44
 *   xl      padding 8/24 · text xl(20/28) semi-bold  · height 44
 * gap 은 모든 size 에서 4px, radius 는 항상 9999(=pill) 이다.
 * (large 프레임만 42 로 그려져 있는데 padding + line-height 합은 44 다.
 *  프레임 높이가 아니라 padding 을 따른다.)
 */
// eslint-disable-next-line @rushstack/typedef-var
const chipVariants = cva(
  `inline-flex cursor-pointer items-center justify-center gap-1 rounded-full whitespace-nowrap transition-colors duration-200 ease-in-out [&_svg]:pointer-events-none [&_svg]:shrink-0 disabled:pointer-events-none disabled:bg-bg-container-disabled disabled:text-text-disabled disabled:border-transparent`,
  {
    variants: {
      /** Figma `style`: active = surface/brand-fill, inactive = surface/fill-alter + 1px stroke/default */
      active: {
        true: "bg-primary-bg text-text-primary [&_svg]:text-text-primary",
        false:
          "bg-fill-quaternary text-text-secondary border border-border [&_svg]:text-text-secondary"
      },
      size: {
        small: "px-3 py-1 text-xs font-medium [&_svg]:size-4",
        default: "px-4 py-2 text-sm font-medium [&_svg]:size-5",
        large: "px-5 py-2 text-lg font-semibold [&_svg]:size-6",
        xl: "px-6 py-2 text-xl font-semibold [&_svg]:size-6"
      }
    },
    defaultVariants: {
      active: false,
      size: "default"
    }
  }
);

export interface IChipProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">,
    ChipVariantsProps {
  children?: React.ReactNode;
  ref?: RefObject<HTMLButtonElement>;
}

export const Chip = ({
  ref,
  active = false,
  size,
  className,
  children,
  ...props
}: IChipProps): JSX.Element => (
  <button
    ref={ref}
    type="button"
    aria-pressed={active ?? false}
    className={cn(chipVariants({ active, size }), className)}
    {...props}
  >
    {children}
  </button>
);
