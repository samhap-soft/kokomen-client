import { TextButton } from "./textButton.tsx";
import { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { AddIcon } from "../icon";

const meta: Meta<typeof TextButton> = {
  title: "Common/TextButton",
  component: TextButton,
  parameters: {
    layout: "centered"
  },
  tags: ["autodocs"],
  args: {
    onClick: fn()
  }
};

export default meta;

type Story = StoryObj<typeof TextButton>;

/** Figma 옵션 테이블의 variant 5종 */
const VARIANTS = [
  "secondary",
  "secondary-low",
  "accent",
  "danger",
  "primary"
] as const;
/** Figma 옵션 테이블의 size 4종 */
const SIZES = ["small", "default", "large", "xl"] as const;

export const Default: Story = {
  args: {
    children: "Text button",
    variant: "secondary",
    size: "default"
  }
};

/** variant 5종 x size 4종. suffix 의 chevron 은 명세상 고정이다. */
export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex items-center gap-3">
          {SIZES.map((size) => (
            <TextButton key={size} {...args} variant={variant} size={size}>
              {variant}
            </TextButton>
          ))}
        </div>
      ))}
    </div>
  )
};

/** Figma 의 Text-button 에는 state 프로퍼티가 없다. disabled 는 코드 확장이다. */
export const Disabled: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      {VARIANTS.map((variant) => (
        <TextButton key={variant} {...args} variant={variant} disabled>
          {variant}
        </TextButton>
      ))}
    </div>
  )
};

/** prefix icon 만 지정할 수 있고 suffix 는 chevron 으로 고정이다. */
export const WithPrefixIcon: Story = {
  args: {
    children: "Text button",
    prefixIcon: <AddIcon />
  }
};
