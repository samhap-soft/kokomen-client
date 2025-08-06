import type { Meta, StoryObj } from "@storybook/react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from "./index";

const meta: Meta<typeof Accordion> = {
  title: "Components/Accordion",
  component: Accordion,
  parameters: {
    layout: "centered"
  },
  tags: ["autodocs"],
  argTypes: {
    allowMultiple: {
      control: { type: "boolean" }
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem itemKey="1">
        <AccordionTrigger>첫 번째 섹션</AccordionTrigger>
        <AccordionContent>
          이것은 첫 번째 아코디언 섹션의 내용입니다. 여기에 원하는 내용을 넣을
          수 있습니다.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem itemKey="2">
        <AccordionTrigger>두 번째 섹션</AccordionTrigger>
        <AccordionContent>
          이것은 두 번째 아코디언 섹션의 내용입니다. 더 많은 정보를 포함할 수
          있습니다.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem itemKey="3">
        <AccordionTrigger>세 번째 섹션</AccordionTrigger>
        <AccordionContent>
          이것은 세 번째 아코디언 섹션의 내용입니다. 복잡한 내용도 포함할 수
          있습니다.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  args: {
    allowMultiple: false
  }
};

export const MultipleOpen: Story = {
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem itemKey="1">
        <AccordionTrigger>첫 번째 섹션</AccordionTrigger>
        <AccordionContent>
          이것은 첫 번째 아코디언 섹션의 내용입니다. 여러 섹션이 동시에 열릴 수
          있습니다.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem itemKey="2">
        <AccordionTrigger>두 번째 섹션</AccordionTrigger>
        <AccordionContent>
          이것은 두 번째 아코디언 섹션의 내용입니다. allowMultiple이 true일 때
          여러 섹션이 열릴 수 있습니다.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem itemKey="3">
        <AccordionTrigger>세 번째 섹션</AccordionTrigger>
        <AccordionContent>
          이것은 세 번째 아코디언 섹션의 내용입니다. 모든 섹션이 동시에 열릴 수
          있습니다.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  args: {
    allowMultiple: true
  }
};

export const WithDefaultOpen: Story = {
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem itemKey="1">
        <AccordionTrigger>첫 번째 섹션 (기본 열림)</AccordionTrigger>
        <AccordionContent>
          이것은 기본적으로 열려있는 첫 번째 아코디언 섹션입니다.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem itemKey="2">
        <AccordionTrigger>두 번째 섹션</AccordionTrigger>
        <AccordionContent>
          이것은 두 번째 아코디언 섹션의 내용입니다.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem itemKey="3">
        <AccordionTrigger>세 번째 섹션</AccordionTrigger>
        <AccordionContent>
          이것은 세 번째 아코디언 섹션의 내용입니다.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  args: {
    allowMultiple: false,
    defaultActiveKey: "1"
  }
};

export const WithMultipleDefaultOpen: Story = {
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem itemKey="1">
        <AccordionTrigger>첫 번째 섹션 (기본 열림)</AccordionTrigger>
        <AccordionContent>
          이것은 기본적으로 열려있는 첫 번째 아코디언 섹션입니다.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem itemKey="2">
        <AccordionTrigger>두 번째 섹션 (기본 열림)</AccordionTrigger>
        <AccordionContent>
          이것은 기본적으로 열려있는 두 번째 아코디언 섹션입니다.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem itemKey="3">
        <AccordionTrigger>세 번째 섹션</AccordionTrigger>
        <AccordionContent>
          이것은 세 번째 아코디언 섹션의 내용입니다.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  args: {
    allowMultiple: true,
    defaultActiveKey: ["1", "2"]
  }
};

export const WithDisabledItems: Story = {
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem itemKey="1">
        <AccordionTrigger>첫 번째 섹션</AccordionTrigger>
        <AccordionContent>
          이것은 첫 번째 아코디언 섹션의 내용입니다.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem itemKey="2" disabled>
        <AccordionTrigger>비활성화된 섹션</AccordionTrigger>
        <AccordionContent>
          이것은 비활성화된 아코디언 섹션입니다. 클릭할 수 없습니다.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem itemKey="3">
        <AccordionTrigger>세 번째 섹션</AccordionTrigger>
        <AccordionContent>
          이것은 세 번째 아코디언 섹션의 내용입니다.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  args: {
    allowMultiple: false
  }
};

export const ComplexContent: Story = {
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem itemKey="1">
        <AccordionTrigger>사용자 정보</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-900">개인 정보</h4>
              <p className="text-sm text-gray-600">이름: 홍길동</p>
              <p className="text-sm text-gray-600">이메일: hong@example.com</p>
              <p className="text-sm text-gray-600">전화번호: 010-1234-5678</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">주소</h4>
              <p className="text-sm text-gray-600">
                서울특별시 강남구 테헤란로 123
              </p>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem itemKey="2">
        <AccordionTrigger>주문 내역</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="text-sm">주문 #12345</span>
              <span className="text-sm text-green-600">완료</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="text-sm">주문 #12346</span>
              <span className="text-sm text-blue-600">배송중</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="text-sm">주문 #12347</span>
              <span className="text-sm text-yellow-600">준비중</span>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem itemKey="3">
        <AccordionTrigger>설정</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">이메일 알림</span>
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">SMS 알림</span>
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">푸시 알림</span>
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  args: {
    allowMultiple: true
  }
};
