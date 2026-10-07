import type { Meta, StoryObj } from "@storybook/react";
import { JSX, useState } from "react";
import { RadioGroup, Radio, RadioGroupProps } from "./index";

const meta: Meta<typeof RadioGroup> = {
  title: "Common/Radio",
  component: RadioGroup,
  parameters: {
    layout: "centered"
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["small", "medium", "large"]
    },
    variant: {
      control: { type: "select" },
      options: ["primary", "success", "warning", "error"],
      description: "Figma 명세 밖 확장. Figma 는 primary 만 정의한다."
    },
    disabled: {
      control: { type: "boolean" }
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

const SIZES = ["small", "medium", "large"] as const;

const RadioTemplate = (args: Partial<RadioGroupProps>): JSX.Element => {
  const [value, setValue] = useState("option1");

  return (
    <RadioGroup {...args} value={value} onChange={setValue}>
      <Radio value="option1">옵션 1</Radio>
      <Radio value="option2">옵션 2</Radio>
      <Radio value="option3">옵션 3</Radio>
    </RadioGroup>
  );
};

export const Default: Story = {
  render: RadioTemplate,
  args: {
    size: "medium",
    variant: "primary"
  }
};

/** Figma 옵션 테이블의 size 3종 — circle 16 · 20 · 24 */
export const Sizes: Story = {
  args: { variant: "primary" },
  render: (args) => (
    <div className="flex flex-col gap-4">
      {SIZES.map((size) => (
        <RadioTemplate key={size} {...args} size={size} />
      ))}
    </div>
  )
};

/**
 * Figma 의 state 는 default · disabled 이고 checked 는 별도 프로퍼티다.
 * disabled 는 surface/neutral-container-disabled 로 채워진다.
 */
export const States: Story = {
  args: { size: "medium", variant: "primary" },
  render: (args) => (
    <div className="flex flex-col gap-4">
      <RadioGroup {...args} value="option1" onChange={() => {}}>
        <Radio value="option1">checked</Radio>
        <Radio value="option2">unchecked</Radio>
      </RadioGroup>
      <RadioGroup {...args} value="option1" onChange={() => {}} disabled>
        <Radio value="option1">checked · disabled</Radio>
        <Radio value="option2">unchecked · disabled</Radio>
      </RadioGroup>
    </div>
  )
};

/** 그룹 전체가 아니라 항목 하나만 비활성화하는 경우. */
export const ItemDisabled: Story = {
  args: { size: "medium", variant: "primary" },
  render: (args) => {
    const Demo = (): JSX.Element => {
      const [value, setValue] = useState("option1");

      return (
        <RadioGroup {...args} value={value} onChange={setValue}>
          <Radio value="option1">옵션 1</Radio>
          <Radio value="option2" disabled>
            옵션 2 (비활성화)
          </Radio>
          <Radio value="option3">옵션 3</Radio>
        </RadioGroup>
      );
    };

    return <Demo />;
  }
};

/**
 * `variant` 는 Figma 명세에 없는 코드 전용 확장이다. Figma 의 체크 색은
 * 언제나 surface/brand-fill(=primary) 하나뿐이다.
 */
export const NonFigmaVariants: Story = {
  args: { size: "medium" },
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(["primary", "success", "warning", "error"] as const).map((variant) => (
        <RadioTemplate key={variant} {...args} variant={variant} />
      ))}
    </div>
  )
};

/** 레이아웃만 세로로 바꾼 경우. 컴포넌트 명세와는 무관하다. */
export const Vertical: Story = {
  args: { size: "medium", variant: "primary" },
  render: (args) => (
    <RadioTemplate {...args} className="flex-col items-start" />
  )
};
