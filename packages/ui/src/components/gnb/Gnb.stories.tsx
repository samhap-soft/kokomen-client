import type { Meta, StoryObj } from "@storybook/react";
import { JSX, useState } from "react";
import { Gnb, GnbMenuItem, GnbProfileButton } from "./index";

const meta: Meta<typeof Gnb> = {
  title: "Components/GNB",
  component: Gnb,
  parameters: {
    layout: "fullscreen"
  },
  tags: ["autodocs"]
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Storybook 에는 앱의 /logo.svg 가 없어 같은 크기(h 50)의 대체 로고를 쓴다. */
const Logo = (): JSX.Element => (
  <span className="flex h-[50px] items-center gap-2 text-2xl font-bold text-text-primary">
    <span aria-hidden>🤖</span>꼬꼬면
  </span>
);

const MENU = [
  { href: "/", label: "홈" },
  { href: "/interviews", label: "모의 면접" },
  { href: "/rank", label: "랭킹" },
  { href: "/resume", label: "이력서" },
  { href: "/purchase", label: "토큰 구매" }
] as const;

/** 스크롤 배경 위에 떠 있는 상태를 보기 위해 Figma 의 히어로처럼 옅은 배경을 깐다. */
const Canvas = ({ children }: { children: React.ReactNode }): JSX.Element => (
  <div className="min-h-[320px] bg-gradient-to-b from-primary-1 to-bg-base p-12">
    {children}
  </div>
);

export const Default: Story = {
  render: () => (
    <Canvas>
      <Gnb logo={<Logo />}>
        {MENU.map((item) => (
          <GnbMenuItem key={item.href} href={item.href}>
            {item.label}
          </GnbMenuItem>
        ))}
      </Gnb>
    </Canvas>
  )
};

/**
 * Figma 의 menu 세트는 default·hover 두 state 만 정의한다.
 * hover 는 orange/100 배경 + radius 8 이다.
 */
export const MenuStates: Story = {
  render: () => (
    <div className="flex flex-col gap-6 bg-bg-base p-12">
      <div className="flex items-center gap-3">
        {MENU.map((item) => (
          <GnbMenuItem key={item.href} href={item.href}>
            {item.label}
          </GnbMenuItem>
        ))}
      </div>
      <div className="flex items-center gap-3">
        {MENU.map((item) => (
          <GnbMenuItem
            key={item.href}
            href={item.href}
            className="bg-orange-1"
          >
            {item.label}
          </GnbMenuItem>
        ))}
      </div>
      <p className="text-sm text-text-tertiary">
        위: default · 아래: hover(강제 적용)
      </p>
    </div>
  )
};

/** `active` 는 Figma 명세 밖 확장이다. 현재 경로를 primary 색으로 구분한다. */
export const WithActiveMenu: Story = {
  render: () => {
    const Demo = (): JSX.Element => {
      const [current, setCurrent] = useState<string>("/interviews");

      return (
        <Canvas>
          <Gnb
            logo={<Logo />}
            profile={<GnbProfileButton onClick={() => setCurrent("/")} />}
          >
            {MENU.map((item) => (
              <GnbMenuItem
                key={item.href}
                href={item.href}
                active={current === item.href}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrent(item.href);
                }}
              >
                {item.label}
              </GnbMenuItem>
            ))}
          </Gnb>
        </Canvas>
      );
    };

    return <Demo />;
  }
};
