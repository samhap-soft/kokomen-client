import { Input } from "./index";
import { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

const meta: Meta<typeof Input> = {
  title: "Common/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    onClick: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof Input>;

export const Primary: Story = {
  args: {
    type: "text",
    variant: "default", // 'primary'가 ButtonProps.variant의 유효한 값이라고 가정
    size: "lg", // 'medium'이 ButtonProps.size의 유효한 값이라고 가정
  },
};

export const Number: Story = {
  args: {
    type: "number",
    variant: "default", // 'primary'가 ButtonProps.variant의 유효한 값이라고 가정
    size: "lg", // 'medium'이 ButtonProps.size의 유효한 값이라고 가정
  },
};

export const Time: Story = {
  args: {
    type: "time",
    variant: "default", // 'primary'가 ButtonProps.variant의 유효한 값이라고 가정
    size: "lg", // 'medium'이 ButtonProps.size의 유효한 값이라고 가정
  },
};

export const Date: Story = {
  args: {
    type: "date",
    variant: "default", // 'primary'가 ButtonProps.variant의 유효한 값이라고 가정
    size: "lg", // 'medium'이 ButtonProps.size의 유효한 값이라고 가정
  },
};

export const Password: Story = {
  args: {
    type: "password",
    variant: "default", // 'primary'가 ButtonProps.variant의 유효한 값이라고 가정
    size: "lg", // 'medium'이 ButtonProps.size의 유효한 값이라고 가정
  },
};

export const Radio: Story = {
  args: {
    type: "radio",
    variant: "default", // 'primary'가 ButtonProps.variant의 유효한 값이라고 가정
    size: "lg", // 'medium'이 ButtonProps.size의 유효한 값이라고 가정
  },
};

export const Checkbox: Story = {
  args: {
    type: "checkbox",
    variant: "default", // 'primary'가 ButtonProps.variant의 유효한 값이라고 가정
    size: "lg", // 'medium'이 ButtonProps.size의 유효한 값이라고 가정
  },
};
