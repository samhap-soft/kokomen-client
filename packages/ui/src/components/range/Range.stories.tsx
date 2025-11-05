import { Range } from "./index";
import { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

const meta: Meta<typeof Range> = {
  title: "Common/Range",
  component: Range,
  parameters: {
    layout: "centered"
  },
  tags: ["autodocs"]
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  render: () => (
    <div className="w-80">
      <Range
        min={0}
        max={100}
        defaultValue={50}
        onChange={(value: number) => fn()(value)}
      />
    </div>
  )
};

export const Dual: Story = {
  render: () => (
    <div className="w-80">
      <Range
        min={0}
        max={100}
        defaultValue={[20, 80] as [number, number]}
        dual
        onChange={(value: [number, number]) => fn()(value)}
      />
    </div>
  )
};

export const PriceRange: Story = {
  render: () => (
    <div className="w-80">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        가격 범위
      </label>
      <Range
        min={0}
        max={100000}
        defaultValue={[30000, 80000] as [number, number]}
        dual
        onChange={(value: [number, number]) => fn()(value)}
      />
    </div>
  )
};

export const SmallRange: Story = {
  render: () => (
    <div className="w-80">
      <Range
        min={0}
        max={10}
        defaultValue={5}
        onChange={(value: number) => fn()(value)}
      />
    </div>
  )
};
