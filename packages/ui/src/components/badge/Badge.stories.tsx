import { Badge } from "./index";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Badge> = {
  title: "Common/Badge",
  component: Badge,
  parameters: {
    layout: "centered"
  },
  tags: ["autodocs"]
};

export default meta;

type Story = StoryObj<typeof Badge>;

const TYPES = ["brand", "success", "warning", "error", "neutral"] as const;

export const Default: Story = {
  args: {
    children: "뱃지",
    appearance: "fill",
    type: "brand"
  }
};

/** Figma 옵션 테이블의 style 2종 x type 5종 */
export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(["fill", "weak"] as const).map((appearance) => (
        <div key={appearance} className="flex items-center gap-3">
          {TYPES.map((type) => (
            <Badge key={type} {...args} appearance={appearance} type={type}>
              {type}
            </Badge>
          ))}
        </div>
      ))}
    </div>
  )
};
