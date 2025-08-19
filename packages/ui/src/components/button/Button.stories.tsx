import { Button } from "./index";
import { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

const meta: Meta<typeof Button> = {
  // Meta<ButtonProps>도 가능
  title: "Common/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  // argTypes는 react-docgen-typescript가 잘 추론하지만,
  // 특정 컨트롤을 지정하거나 설명을 추가하고 싶을 때 사용합니다.
  // 모든 스토리에 적용될 기본 args (onClick을 fn으로 설정)
  args: {
    onClick: fn(), // onClick 이벤트가 발생하면 Actions 탭에 기록됨
  },
};

export default meta;

// StoryObj 타입을 사용하여 스토리 타입을 명시
type Story = StoryObj<typeof Button>; // 또는 StoryObj<ButtonProps>

export const Primary: Story = {
  args: {
    children: "Primary Button", // Button 컴포넌트가 children으로 텍스트를 받는다고 가정
    variant: "text", // 'primary'가 ButtonProps.variant의 유효한 값이라고 가정
    size: "default", // 'medium'이 ButtonProps.size의 유효한 값이라고 가정
    round: false,
    danger: false,
  },
};
