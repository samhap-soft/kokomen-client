import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "./index";

const meta: Meta<typeof Textarea> = {
  title: "Common/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered"
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "red"]
    },
    border: {
      control: { type: "select" },
      options: ["default", "none"]
    },
    size: {
      control: { type: "select" },
      options: ["default", "sm", "lg", "xl"]
    },
    autoAdjust: {
      control: { type: "boolean" }
    },
    disabled: {
      control: { type: "boolean" }
    },
    placeholder: {
      control: { type: "text" }
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "default-textarea",
    placeholder: "기본 텍스트 영역입니다..."
  }
};

export const Small: Story = {
  args: {
    name: "small-textarea",
    size: "sm",
    placeholder: "작은 크기의 텍스트 영역입니다..."
  }
};

export const Large: Story = {
  args: {
    name: "large-textarea",
    size: "lg",
    placeholder: "큰 크기의 텍스트 영역입니다..."
  }
};

export const ExtraLarge: Story = {
  args: {
    name: "xl-textarea",
    size: "xl",
    placeholder: "매우 큰 크기의 텍스트 영역입니다..."
  }
};

export const WithAutoAdjust: Story = {
  args: {
    name: "auto-adjust-textarea",
    autoAdjust: true,
    placeholder:
      "자동으로 높이가 조절되는 텍스트 영역입니다. 긴 텍스트를 입력해보세요..."
  }
};

export const WithError: Story = {
  args: {
    name: "error-textarea",
    variant: "red",
    placeholder: "에러 상태의 텍스트 영역입니다..."
  }
};

export const NoBorder: Story = {
  args: {
    name: "no-border-textarea",
    border: "none",
    placeholder: "테두리가 없는 텍스트 영역입니다..."
  }
};

export const Disabled: Story = {
  args: {
    name: "disabled-textarea",
    disabled: true,
    placeholder: "비활성화된 텍스트 영역입니다..."
  }
};

export const WithValue: Story = {
  args: {
    name: "with-value-textarea",
    defaultValue:
      "이미 값이 들어있는 텍스트 영역입니다. 이 텍스트는 기본값으로 설정되어 있습니다.",
    placeholder: "텍스트를 입력하세요..."
  }
};
