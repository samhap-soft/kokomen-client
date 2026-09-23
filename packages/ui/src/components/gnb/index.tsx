import { cva, VariantProps } from "class-variance-authority";
import React, { AnchorHTMLAttributes, ButtonHTMLAttributes, JSX } from "react";
import { cn } from "../../utils/index.ts";
import { MyProfileIcon } from "../icon";

/**
 * Figma: Component/GNB (완) — 컴포넌트 504:25 · 메뉴 세트 505:77
 *
 * 데스크톱 전용 글로벌 내비게이션이다. 흰 배경의 알약 모양 바가 떠 있는
 * 형태로, 좌측에 로고 · 우측에 메뉴와 프로필 아이콘이 붙는다.
 *
 * 실측값:
 *   bar       1182x82 · padding 16/48 · radius full · surface/neutral · shadow/base
 *   menu      좌우 묶음 사이 gap 20
 *   menu list gap 12 · 좌우 padding 8
 *   menu item padding 10 · base/medium(16/24) · onsurface/neutral
 *             hover 에서 orange/100 배경 + radius 8
 *   profile   icon_my_profile 48px · primary/600
 *
 * NOTE Figma 의 menu 세트에는 default·hover 두 state 만 있고 현재 경로를 나타내는
 * 상태가 없다. 기존 헤더가 활성 메뉴를 primary 색으로 구분하고 있었기 때문에
 * `active` 를 명세 밖 확장으로 남겨둔다.
 * NOTE 모바일 GNB 는 Figma 에 없다. 모바일은 기존 헤더를 그대로 쓴다.
 */
export interface GnbProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  /** 좌측 로고 슬롯. next/image 등 앱 쪽 구현을 그대로 받는다. */
  logo: React.ReactNode;
  /** 메뉴 항목. `GnbMenuItem` 을 나열한다. */
  children?: React.ReactNode;
  /** 메뉴 오른쪽 끝 슬롯. 비우면 `GnbProfileButton` 이 렌더된다. */
  profile?: React.ReactNode;
}

export interface GnbProfileButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** 아이콘 대신 아바타 이미지 등을 넣고 싶을 때 사용한다. */
  children?: React.ReactNode;
}

export const GnbProfileButton = ({
  className,
  children,
  ...props
}: GnbProfileButtonProps): JSX.Element => (
  <button
    type="button"
    aria-label="내 프로필"
    className={cn(
      "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full text-primary transition-opacity duration-200 ease-in-out hover:opacity-80",
      className
    )}
    {...props}
  >
    {children ?? <MyProfileIcon size={48} />}
  </button>
);

GnbProfileButton.displayName = "GnbProfileButton";

export const Gnb = ({
  logo,
  children,
  profile,
  className,
  ...props
}: GnbProps): JSX.Element => (
  <nav
    className={cn(
      "mx-auto flex w-full max-w-[1182px] items-center justify-between gap-6 rounded-full bg-bg-base px-12 py-4 shadow-base",
      className
    )}
    {...props}
  >
    <div className="flex shrink-0 items-center">{logo}</div>
    <div className="flex items-center gap-5">
      {children ? (
        <div className="flex items-center gap-3 px-2">{children}</div>
      ) : null}
      {profile ?? <GnbProfileButton />}
    </div>
  </nav>
);

Gnb.displayName = "Gnb";

// eslint-disable-next-line @rushstack/typedef-var
const gnbMenuItemVariants = cva(
  "inline-flex cursor-pointer items-center justify-center rounded-lg p-2.5 text-base leading-6 font-medium whitespace-nowrap transition-colors duration-200 ease-in-out hover:bg-orange-1",
  {
    variants: {
      /** Figma 명세 밖 확장. 현재 경로를 표시한다. */
      active: {
        true: "text-primary",
        false: "text-text-primary"
      }
    },
    defaultVariants: {
      active: false
    }
  }
);

export interface GnbMenuItemProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children">,
    VariantProps<typeof gnbMenuItemVariants> {
  /** 렌더할 엘리먼트/컴포넌트. 라우터 링크(`next/link`)를 넘기는 용도다. */
  as?: React.ElementType;
  children?: React.ReactNode;
}

export const GnbMenuItem = ({
  as = "a",
  active = false,
  className,
  children,
  ...props
}: GnbMenuItemProps): JSX.Element => {
  // `React.ElementType` 그대로 렌더하면 intrinsic 엘리먼트 유니온 때문에
  // children 이 never 로 좁혀진다. 슬롯이므로 props 타입은 호출부가 책임진다.
  const Component = as as React.ComponentType<Record<string, unknown>>;

  return (
    <Component
      className={cn(gnbMenuItemVariants({ active }), className)}
      aria-current={active ? "page" : undefined}
      {...props}
    >
      {children}
    </Component>
  );
};

GnbMenuItem.displayName = "GnbMenuItem";
