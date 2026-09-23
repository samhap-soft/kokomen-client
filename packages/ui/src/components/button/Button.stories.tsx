import { Button } from "./index";
import { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { AddIcon, ChevronRightIcon } from "../icon";
import { legacyButtonStyles } from "./legacyStyles.ts";

const meta: Meta<typeof Button> = {
  title: "Common/Button",
  component: Button,
  parameters: {
    layout: "centered"
  },
  tags: ["autodocs"],
  args: {
    onClick: fn()
  }
};

export default meta;

type Story = StoryObj<typeof Button>;

const VARIANTS = ["primary", "secondary", "danger", "primary-soft"] as const;
const SIZES = ["small", "default", "large", "xl"] as const;

export const Primary: Story = {
  args: {
    children: "Button",
    variant: "primary",
    size: "default"
  }
};

/** Figma 옵션 테이블의 variant 4종 x size 4종 */
export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex items-center gap-3">
          {SIZES.map((size) => (
            <Button key={size} {...args} variant={variant} size={size}>
              {variant}
            </Button>
          ))}
        </div>
      ))}
    </div>
  )
};

/** danger 에는 Figma 명세상 disabled 상태가 없다. */
export const States: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex items-center gap-3">
          <Button {...args} variant={variant}>
            default
          </Button>
          <Button {...args} variant={variant} disabled>
            disabled
          </Button>
        </div>
      ))}
    </div>
  )
};

/** prefix icon 과 suffix icon 을 동시에 쓰는 것은 디자인 가이드에서 지양한다. */
export const WithIcon: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <Button {...args} prefixIcon={<AddIcon />}>
        prefix icon
      </Button>
      <Button {...args} variant="secondary" suffixIcon={<ChevronRightIcon />}>
        suffix icon
      </Button>
    </div>
  )
};

export const Round: Story = {
  args: {
    children: "Button",
    round: true
  }
};

/**
 * Figma 명세 밖 모양이 필요한 기존 화면용 프리셋이다. `variant="none"` 과 함께
 * className 으로 붙인다. 화면 디자인이 Figma 로 정리되는 대로 없앤다.
 */
export const LegacyStyles: Story = {
  render: (args) => (
    <div className="grid grid-cols-3 gap-3 bg-gradient-to-r from-primary-1 to-primary-3 p-6">
      {(
        Object.keys(legacyButtonStyles) as (keyof typeof legacyButtonStyles)[]
      ).map((preset) => (
        <Button
          key={preset}
          {...args}
          variant="none"
          className={legacyButtonStyles[preset]}
        >
          {preset}
        </Button>
      ))}
    </div>
  )
};
