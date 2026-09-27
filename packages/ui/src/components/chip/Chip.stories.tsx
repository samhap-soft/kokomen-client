import { Chip } from "./index";
import { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

const meta: Meta<typeof Chip> = {
  title: "Common/Chip",
  component: Chip,
  parameters: {
    layout: "centered"
  },
  tags: ["autodocs"],
  args: {
    onClick: fn()
  }
};

export default meta;

type Story = StoryObj<typeof Chip>;

const SIZES = ["small", "default", "large", "xl"] as const;

export const Inactive: Story = {
  args: {
    children: "Chip",
    active: false,
    size: "default"
  }
};

/** Figma 옵션 테이블의 style 2종 x size 4종 */
export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      {[true, false].map((active) => (
        <div key={String(active)} className="flex items-center gap-3">
          {SIZES.map((size) => (
            <Chip key={size} {...args} active={active} size={size}>
              {active ? "active" : "inactive"}
            </Chip>
          ))}
        </div>
      ))}
    </div>
  )
};

/** disabled 는 Figma 명세에 없지만 button 이므로 Button 과 같은 토큰을 쓴다. */
export const Disabled: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <Chip {...args} disabled>
        inactive
      </Chip>
      <Chip {...args} active disabled>
        active
      </Chip>
    </div>
  )
};
