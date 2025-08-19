import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { RadioGroup, Radio } from "./index";

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
      options: ["primary", "success", "warning", "error"]
    },
    disabled: {
      control: { type: "boolean" }
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

const RadioTemplate = (args: any) => {
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

export const Small: Story = {
  render: RadioTemplate,
  args: {
    size: "small",
    variant: "primary"
  }
};

export const Large: Story = {
  render: RadioTemplate,
  args: {
    size: "large",
    variant: "primary"
  }
};

export const Success: Story = {
  render: RadioTemplate,
  args: {
    size: "medium",
    variant: "success"
  }
};

export const Warning: Story = {
  render: RadioTemplate,
  args: {
    size: "medium",
    variant: "warning"
  }
};

export const Error: Story = {
  render: RadioTemplate,
  args: {
    size: "medium",
    variant: "error"
  }
};

export const Disabled: Story = {
  render: (args) => {
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
  },
  args: {
    size: "medium",
    variant: "primary"
  }
};

export const AllDisabled: Story = {
  render: RadioTemplate,
  args: {
    size: "medium",
    variant: "primary",
    disabled: true
  }
};

export const Vertical: Story = {
  render: (args) => {
    const [value, setValue] = useState("option1");

    return (
      <RadioGroup
        {...args}
        value={value}
        onChange={setValue}
        className="flex-col items-start"
      >
        <Radio value="option1">첫 번째 옵션</Radio>
        <Radio value="option2">두 번째 옵션</Radio>
        <Radio value="option3">세 번째 옵션</Radio>
        <Radio value="option4">네 번째 옵션</Radio>
      </RadioGroup>
    );
  },
  args: {
    size: "medium",
    variant: "primary"
  }
};

export const WithDefaultValue: Story = {
  render: (args) => {
    const [value, setValue] = useState("option2");

    return (
      <RadioGroup {...args} value={value} onChange={setValue}>
        <Radio value="option1">옵션 1</Radio>
        <Radio value="option2">옵션 2 (기본 선택)</Radio>
        <Radio value="option3">옵션 3</Radio>
      </RadioGroup>
    );
  },
  args: {
    size: "medium",
    variant: "primary"
  }
};

export const ComplexOptions: Story = {
  render: (args) => {
    const [value, setValue] = useState("free");

    return (
      <RadioGroup
        {...args}
        value={value}
        onChange={setValue}
        className="flex-col items-start space-y-2"
      >
        <Radio value="free">
          <div>
            <div className="font-medium">무료 플랜</div>
            <div className="text-sm text-gray-600">기본 기능만 사용 가능</div>
          </div>
        </Radio>
        <Radio value="pro">
          <div>
            <div className="font-medium">프로 플랜</div>
            <div className="text-sm text-gray-600">모든 기능 사용 가능</div>
          </div>
        </Radio>
        <Radio value="enterprise">
          <div>
            <div className="font-medium">엔터프라이즈 플랜</div>
            <div className="text-sm text-gray-600">맞춤형 솔루션 제공</div>
          </div>
        </Radio>
      </RadioGroup>
    );
  },
  args: {
    size: "medium",
    variant: "primary"
  }
};
