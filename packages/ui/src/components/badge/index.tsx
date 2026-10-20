import { cva, VariantProps } from "class-variance-authority";
import React, { HTMLAttributes, JSX } from "react";
import { cn } from "../../utils/index.ts";

type BadgeVariantsProps = VariantProps<typeof badgeVariants>;

/**
 * Figma: Paragraph.Badge — component set 651:164
 *
 * style(fill · weak) x type(brand · success · warning · error · neutral).
 * 상호작용이 없는 라벨이라 hover · disabled 상태는 없다.
 * 공통: padding 2/8 · radius 6 · text xs/semi-bold 고정.
 *
 * NOTE warning 계열은 Figma 가 #fff5f0 / #852e00 / #fa6c19 로 그려져 있지만
 * 레포의 warning-* 토큰(volcano 1·9·6)과 미세하게 다르다. 토큰을 따른다.
 */
// eslint-disable-next-line @rushstack/typedef-var
const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold whitespace-nowrap",
  {
    variants: {
      /** Figma `style`. React 의 `style` prop 과 겹치므로 `appearance` 로 노출한다. */
      appearance: {
        fill: "",
        weak: ""
      },
      type: {
        brand: "",
        success: "",
        warning: "",
        error: "",
        neutral: ""
      }
    },
    compoundVariants: [
      /** surface/brand-fill + onsurface/neutral */
      { appearance: "fill", type: "brand", className: "bg-primary-bg text-text-primary" },
      /** surface/success + onsurface/neutral */
      { appearance: "fill", type: "success", className: "bg-success text-text-primary" },
      /** surface/warning + onsurface/neutral-inverse */
      { appearance: "fill", type: "warning", className: "bg-warning text-text-light-solid" },
      /** surface/error + onsurface/neutral-inverse */
      { appearance: "fill", type: "error", className: "bg-error text-text-light-solid" },
      /** surface/fill + onsurface/neutral */
      { appearance: "fill", type: "neutral", className: "bg-fill text-text-primary" },
      /** surface/brand-weak + onsurface/brand */
      { appearance: "weak", type: "brand", className: "bg-primary-bg-light text-primary-text" },
      /** surface/success-fill + onsurface/success */
      { appearance: "weak", type: "success", className: "bg-success-bg text-success-text" },
      /** surface/warning-fill + onsurface/warning */
      { appearance: "weak", type: "warning", className: "bg-warning-bg text-warning-text" },
      /** surface/error-fill + onsurface/error */
      { appearance: "weak", type: "error", className: "bg-error-bg text-error-text" },
      /** surface/neutral-layout + onsurface/neutral */
      { appearance: "weak", type: "neutral", className: "bg-bg-layout text-text-primary" }
    ],
    defaultVariants: {
      appearance: "fill",
      type: "brand"
    }
  }
);

export interface IBadgeProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children">,
    BadgeVariantsProps {
  children?: React.ReactNode;
}

export const Badge = ({
  appearance,
  type,
  className,
  children,
  ...props
}: IBadgeProps): JSX.Element => (
  <span className={cn(badgeVariants({ appearance, type }), className)} {...props}>
    {children}
  </span>
);
