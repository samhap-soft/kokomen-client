import Select from "#components/select/index.tsx";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Select> = {
  title: "Components/Select",
  component: Select,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["small", "medium", "large"],
    },
    disabled: {
      control: { type: "boolean" },
    },
    searchable: {
      control: { type: "boolean" },
    },
    error: {
      control: { type: "boolean" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleOptions = [
  { value: "option1", label: "옵션 1" },
  { value: "option2", label: "옵션 2" },
  { value: "option3", label: "옵션 3" },
  { value: "option4", label: "옵션 4" },
  { value: "option5", label: "옵션 5" },
  { value: "disabled", label: "비활성화된 옵션", disabled: true },
];

export const Default: Story = {
  args: {
    options: sampleOptions,
    placeholder: "옵션을 선택하세요",
  },
};

export const WithValue: Story = {
  args: {
    options: sampleOptions,
    value: "option2",
    placeholder: "옵션을 선택하세요",
  },
};

export const Searchable: Story = {
  args: {
    options: sampleOptions,
    searchable: true,
    placeholder: "검색하여 선택하세요",
  },
};

export const Small: Story = {
  args: {
    options: sampleOptions,
    size: "small",
    placeholder: "작은 크기",
  },
};

export const Large: Story = {
  args: {
    options: sampleOptions,
    size: "large",
    placeholder: "큰 크기",
  },
};

export const Disabled: Story = {
  args: {
    options: sampleOptions,
    disabled: true,
    placeholder: "비활성화됨",
  },
};

export const WithError: Story = {
  args: {
    options: sampleOptions,
    error: true,
    errorMessage: "필수 항목입니다",
    placeholder: "에러 상태",
  },
};

export const ManyOptions: Story = {
  args: {
    options: Array.from({ length: 50 }, (_, i) => ({
      value: `option${i + 1}`,
      label: `옵션 ${i + 1}`,
    })),
    searchable: true,
    placeholder: "많은 옵션들",
  },
};
