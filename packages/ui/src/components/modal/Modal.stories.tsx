import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Modal } from "./index";
import { Button } from "../button";

const meta: Meta<typeof Modal> = {
  title: "Components/Modal",
  component: Modal,
  parameters: {
    layout: "centered"
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "full"]
    },
    escToClose: {
      control: { type: "boolean" }
    },
    backdropClose: {
      control: { type: "boolean" }
    },
    closeButton: {
      control: { type: "boolean" }
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

const ModalTemplate = (args: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>모달 열기</Button>
      <Modal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <p>이것은 모달 내용입니다. 여기에 원하는 내용을 넣을 수 있습니다.</p>
        <div className="mt-4 flex gap-2">
          <Button onClick={() => setIsOpen(false)}>확인</Button>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            취소
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export const Default: Story = {
  render: ModalTemplate,
  args: {
    title: "기본 모달",
    size: "md"
  }
};

export const Small: Story = {
  render: ModalTemplate,
  args: {
    title: "작은 모달",
    size: "sm"
  }
};

export const Large: Story = {
  render: ModalTemplate,
  args: {
    title: "큰 모달",
    size: "lg"
  }
};

export const ExtraLarge: Story = {
  render: ModalTemplate,
  args: {
    title: "매우 큰 모달",
    size: "xl"
  }
};

export const FullWidth: Story = {
  render: ModalTemplate,
  args: {
    title: "전체 너비 모달",
    size: "full"
  }
};

export const WithoutCloseButton: Story = {
  render: ModalTemplate,
  args: {
    title: "닫기 버튼 없는 모달",
    closeButton: false
  }
};

export const WithBackdropClose: Story = {
  render: ModalTemplate,
  args: {
    title: "배경 클릭으로 닫기 가능",
    backdropClose: true
  }
};

export const WithEscapeClose: Story = {
  render: ModalTemplate,
  args: {
    title: "ESC 키로 닫기 가능",
    escToClose: true
  }
};

export const ComplexContent: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div>
        <Button onClick={() => setIsOpen(true)}>복잡한 내용 모달 열기</Button>
        <Modal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">복잡한 모달 내용</h3>
            <p className="text-gray-600">
              이 모달은 더 복잡한 내용을 포함하고 있습니다. 여러 요소들이 포함된
              모달의 예시입니다.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">정보 섹션</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 첫 번째 항목</li>
                <li>• 두 번째 항목</li>
                <li>• 세 번째 항목</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsOpen(false)}>확인</Button>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                취소
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  },
  args: {
    title: "복잡한 내용 모달",
    size: "lg"
  }
};
