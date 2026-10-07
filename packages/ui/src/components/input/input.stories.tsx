import { Input } from "./index";
import { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

const meta: Meta<typeof Input> = {
  title: "Common/Input",
  component: Input,
  parameters: {
    layout: "centered"
  },
  tags: ["autodocs"],
  args: {
    onChange: fn(),
    placeholder: "입력해주세요"
  }
};

export default meta;

type Story = StoryObj<typeof Input>;

/** Figma 옵션 테이블의 variant 2종 */
const VARIANTS = ["default", "red"] as const;
/** Figma 옵션 테이블의 size 4종 */
const SIZES = ["default", "lg", "xl", "2xl"] as const;

export const Default: Story = {
  args: {
    type: "text",
    variant: "default",
    size: "default"
  }
};

export const Red: Story = {
  args: {
    type: "text",
    variant: "red",
    size: "default"
  }
};

/** variant 2종 x size 4종 */
export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex items-start gap-3">
          {SIZES.map((size) => (
            <Input
              key={size}
              {...args}
              variant={variant}
              size={size}
              placeholder={`${variant} / ${size}`}
            />
          ))}
        </div>
      ))}
    </div>
  )
};

/**
 * Figma 의 state 는 default · hover · filled · disabled 다.
 * hover 는 마우스 오버로만 볼 수 있어 나머지 3종만 세운다.
 */
export const States: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex items-center gap-3">
          <Input {...args} variant={variant} placeholder="default" />
          <Input {...args} variant={variant} defaultValue="filled" />
          <Input {...args} variant={variant} defaultValue="disabled" disabled />
        </div>
      ))}
    </div>
  )
};

/** `type` 은 Figma 명세 밖이지만 실제 폼에서 쓰이는 조합이다. */
export const InputTypes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      {(["text", "number", "time", "date", "password"] as const).map((type) => (
        <Input key={type} {...args} type={type} placeholder={type} />
      ))}
    </div>
  )
};
