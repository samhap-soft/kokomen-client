import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Sidebar } from "./index";
import { Button } from "../button";

const meta: Meta<typeof Sidebar> = {
  title: "Components/Sidebar",
  component: Sidebar,
  parameters: {
    layout: "fullscreen"
  },
  tags: ["autodocs"],
  argTypes: {
    placement: {
      control: { type: "select" },
      options: ["left", "right", "top", "bottom"]
    },
    size: {
      control: { type: "select" },
      options: ["default", "large"]
    },
    zIndex: {
      control: { type: "select" },
      options: ["default", "high", "higher"]
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

const SidebarTemplate = (args: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Button onClick={() => setIsOpen(true)}>사이드바 열기</Button>

      <Sidebar {...args} open={isOpen} onClose={() => setIsOpen(false)}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">사이드바 제목</h2>
          <p className="text-gray-600 mb-4">
            이것은 사이드바의 내용입니다. 여기에 원하는 내용을 넣을 수 있습니다.
          </p>
          <div className="space-y-2">
            <div className="p-3 bg-gray-100 rounded-lg">
              <h3 className="font-medium">첫 번째 섹션</h3>
              <p className="text-sm text-gray-600">섹션 내용</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <h3 className="font-medium">두 번째 섹션</h3>
              <p className="text-sm text-gray-600">섹션 내용</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <h3 className="font-medium">세 번째 섹션</h3>
              <p className="text-sm text-gray-600">섹션 내용</p>
            </div>
          </div>
        </div>
      </Sidebar>
    </div>
  );
};

export const Default: Story = {
  render: SidebarTemplate,
  args: {
    placement: "right",
    size: "default"
  }
};

export const LeftPlacement: Story = {
  render: SidebarTemplate,
  args: {
    placement: "left",
    size: "default"
  }
};

export const TopPlacement: Story = {
  render: SidebarTemplate,
  args: {
    placement: "top",
    size: "default"
  }
};

export const BottomPlacement: Story = {
  render: SidebarTemplate,
  args: {
    placement: "bottom",
    size: "default"
  }
};

export const LargeSize: Story = {
  render: SidebarTemplate,
  args: {
    placement: "right",
    size: "large"
  }
};

export const WithoutCloseButton: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Button onClick={() => setIsOpen(true)}>
          닫기 버튼 없는 사이드바 열기
        </Button>

        <Sidebar
          {...args}
          open={isOpen}
          onClose={() => setIsOpen(false)}
          closable={false}
        >
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">닫기 버튼 없는 사이드바</h2>
            <p className="text-gray-600 mb-4">
              이 사이드바는 닫기 버튼이 없습니다. 오버레이를 클릭하거나 ESC 키를
              눌러서 닫을 수 있습니다.
            </p>
            <Button onClick={() => setIsOpen(false)}>수동으로 닫기</Button>
          </div>
        </Sidebar>
      </div>
    );
  },
  args: {
    placement: "right",
    size: "default"
  }
};

export const ComplexContent: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Button onClick={() => setIsOpen(true)}>
          복잡한 내용 사이드바 열기
        </Button>

        <Sidebar {...args} open={isOpen} onClose={() => setIsOpen(false)}>
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">사용자 프로필</h2>

            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  홍
                </div>
                <div className="ml-3">
                  <h3 className="font-medium">홍길동</h3>
                  <p className="text-sm text-gray-600">hong@example.com</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">개인 정보</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">이름:</span>
                    <span>홍길동</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">이메일:</span>
                    <span>hong@example.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">전화번호:</span>
                    <span>010-1234-5678</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">설정</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    이메일 알림
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    SMS 알림
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    푸시 알림
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full">
                  설정 저장
                </Button>
              </div>
            </div>
          </div>
        </Sidebar>
      </div>
    );
  },
  args: {
    placement: "right",
    size: "default"
  }
};

export const HighZIndex: Story = {
  render: SidebarTemplate,
  args: {
    placement: "right",
    size: "default",
    zIndex: "high"
  }
};

export const DestroyOnClose: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Button onClick={() => setIsOpen(true)}>
          Destroy on Close 사이드바 열기
        </Button>

        <Sidebar
          {...args}
          open={isOpen}
          onClose={() => setIsOpen(false)}
          destroyOnClose
        >
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Destroy on Close</h2>
            <p className="text-gray-600 mb-4">
              이 사이드바는 닫힐 때 DOM에서 완전히 제거됩니다.
            </p>
            <p className="text-sm text-gray-500">
              개발자 도구에서 확인해보세요. 사이드바가 닫히면 DOM 요소가
              사라집니다.
            </p>
          </div>
        </Sidebar>
      </div>
    );
  },
  args: {
    placement: "right",
    size: "default"
  }
};
