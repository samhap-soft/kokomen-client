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
type Story = StoryObj<typeof Range>;

/** Figma 의 mode=single. title 과 현재 값, min·max 라벨이 함께 그려진다. */
export const Single: Story = {
  args: {
    min: 0,
    max: 100,
    defaultValue: 50,
    title: "난이도",
    onChange: fn()
  },
  render: (args) => (
    <div className="w-80">
      <Range {...args} />
    </div>
  )
};

/** Figma 의 mode=dual. */
export const Dual: Story = {
  args: {
    min: 0,
    max: 100,
    dual: true,
    defaultValue: [20, 80],
    title: "구간",
    onChange: fn()
  },
  render: (args) => (
    <div className="w-80">
      <Range {...args} />
    </div>
  )
};

/** Figma 의 state=disabled. progress 가 gray/500 으로 바뀐다. */
export const Disabled: Story = {
  args: {
    min: 0,
    max: 100,
    defaultValue: 40,
    title: "난이도",
    disabled: true,
    onChange: fn()
  },
  render: (args) => (
    <div className="w-80">
      <Range {...args} />
    </div>
  )
};

/** `unit` 과 `showBounds` 조합. 호출부가 자체 라벨을 그릴 때 bounds 를 끈다. */
export const WithUnit: Story = {
  args: {
    min: 0,
    max: 100000,
    dual: true,
    defaultValue: [30000, 80000],
    title: "가격 범위",
    unit: "원",
    showBounds: false,
    onChange: fn()
  },
  render: (args) => (
    <div className="w-80">
      <Range {...args} />
    </div>
  )
};
