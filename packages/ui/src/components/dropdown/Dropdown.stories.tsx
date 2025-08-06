import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Dropdown, DropdownItem, DropdownTrigger } from "./index";
import { Button } from "../button";

const meta: Meta<typeof Dropdown> = {
  title: "Components/Dropdown",
  component: Dropdown,
  parameters: {
    layout: "centered"
  },
  tags: ["autodocs"],
  argTypes: {
    placement: {
      control: { type: "select" },
      options: ["top", "bottom", "left", "right"]
    },
    disabled: {
      control: { type: "boolean" }
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Dropdown trigger={<Button>드롭다운 열기</Button>}>
      <DropdownItem onClick={() => console.log("옵션 1 클릭")}>
        옵션 1
      </DropdownItem>
      <DropdownItem onClick={() => console.log("옵션 2 클릭")}>
        옵션 2
      </DropdownItem>
      <DropdownItem onClick={() => console.log("옵션 3 클릭")}>
        옵션 3
      </DropdownItem>
    </Dropdown>
  )
};

export const WithTrigger: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <Dropdown
        trigger={
          <DropdownTrigger isOpen={isOpen}>
            <Button>커스텀 트리거</Button>
          </DropdownTrigger>
        }
      >
        <DropdownItem onClick={() => console.log("메뉴 1 클릭")}>
          메뉴 1
        </DropdownItem>
        <DropdownItem onClick={() => console.log("메뉴 2 클릭")}>
          메뉴 2
        </DropdownItem>
        <DropdownItem onClick={() => console.log("메뉴 3 클릭")}>
          메뉴 3
        </DropdownItem>
      </Dropdown>
    );
  }
};

export const TopPlacement: Story = {
  render: () => (
    <div className="h-32 flex items-end">
      <Dropdown trigger={<Button>위쪽 배치</Button>} placement="top">
        <DropdownItem onClick={() => console.log("옵션 1 클릭")}>
          옵션 1
        </DropdownItem>
        <DropdownItem onClick={() => console.log("옵션 2 클릭")}>
          옵션 2
        </DropdownItem>
        <DropdownItem onClick={() => console.log("옵션 3 클릭")}>
          옵션 3
        </DropdownItem>
      </Dropdown>
    </div>
  )
};

export const LeftPlacement: Story = {
  render: () => (
    <div className="flex justify-end">
      <Dropdown trigger={<Button>왼쪽 배치</Button>} placement="left">
        <DropdownItem onClick={() => console.log("옵션 1 클릭")}>
          옵션 1
        </DropdownItem>
        <DropdownItem onClick={() => console.log("옵션 2 클릭")}>
          옵션 2
        </DropdownItem>
        <DropdownItem onClick={() => console.log("옵션 3 클릭")}>
          옵션 3
        </DropdownItem>
      </Dropdown>
    </div>
  )
};

export const RightPlacement: Story = {
  render: () => (
    <Dropdown trigger={<Button>오른쪽 배치</Button>} placement="right">
      <DropdownItem onClick={() => console.log("옵션 1 클릭")}>
        옵션 1
      </DropdownItem>
      <DropdownItem onClick={() => console.log("옵션 2 클릭")}>
        옵션 2
      </DropdownItem>
      <DropdownItem onClick={() => console.log("옵션 3 클릭")}>
        옵션 3
      </DropdownItem>
    </Dropdown>
  )
};

export const WithDisabledItems: Story = {
  render: () => (
    <Dropdown trigger={<Button>비활성화된 항목 포함</Button>}>
      <DropdownItem onClick={() => console.log("활성 옵션 클릭")}>
        활성 옵션
      </DropdownItem>
      <DropdownItem disabled>비활성화된 옵션</DropdownItem>
      <DropdownItem onClick={() => console.log("다른 활성 옵션 클릭")}>
        다른 활성 옵션
      </DropdownItem>
    </Dropdown>
  )
};

export const DisabledDropdown: Story = {
  render: () => (
    <Dropdown trigger={<Button>비활성화된 드롭다운</Button>} disabled>
      <DropdownItem onClick={() => console.log("옵션 1 클릭")}>
        옵션 1
      </DropdownItem>
      <DropdownItem onClick={() => console.log("옵션 2 클릭")}>
        옵션 2
      </DropdownItem>
    </Dropdown>
  )
};

export const ComplexContent: Story = {
  render: () => (
    <Dropdown trigger={<Button>복잡한 내용</Button>}>
      <DropdownItem>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>프로필</span>
        </div>
      </DropdownItem>
      <DropdownItem>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>설정</span>
        </div>
      </DropdownItem>
      <DropdownItem>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>로그아웃</span>
        </div>
      </DropdownItem>
    </Dropdown>
  )
};

export const WithDividers: Story = {
  render: () => (
    <Dropdown trigger={<Button>구분선 포함</Button>}>
      <DropdownItem onClick={() => console.log("편집 클릭")}>편집</DropdownItem>
      <DropdownItem onClick={() => console.log("복사 클릭")}>복사</DropdownItem>
      <div className="border-t border-gray-200 my-1"></div>
      <DropdownItem onClick={() => console.log("삭제 클릭")}>삭제</DropdownItem>
    </Dropdown>
  )
};
