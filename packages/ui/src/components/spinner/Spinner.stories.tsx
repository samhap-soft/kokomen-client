import type { Meta, StoryObj } from "@storybook/react";
import { LoadingCircles, LoadingFullScreen, RoundSpinner } from "./index";

const meta: Meta<typeof LoadingCircles> = {
  title: "Components/Spinner",
  component: LoadingCircles,
  parameters: {
    layout: "centered"
  },
  tags: ["autodocs"]
};

export default meta;
type Story = StoryObj<typeof meta>;

export const LoadingCirclesDefault: Story = {
  render: () => <LoadingCircles />
};

export const RoundSpinnerDefault: Story = {
  render: () => <RoundSpinner />
};

export const LoadingFullScreenDefault: Story = {
  render: () => (
    <div className="h-64 w-full border border-gray-200 rounded-lg">
      <LoadingFullScreen />
    </div>
  )
};

export const AllSpinners: Story = {
  render: () => (
    <div className="space-y-8 flex flex-col items-center">
      <div className="flex flex-col items-center text-center">
        <h3 className="text-lg font-medium mb-4">Loading Circles</h3>
        <LoadingCircles />
      </div>

      <div className="flex flex-col items-center text-center">
        <h3 className="text-lg font-medium mb-4">Round Spinner</h3>
        <RoundSpinner />
      </div>

      <div className="flex flex-col items-center text-center">
        <h3 className="text-lg font-medium mb-4">Full Screen Loading</h3>
        <div className="h-32 w-full border border-gray-200 rounded-lg">
          <LoadingFullScreen />
        </div>
      </div>
    </div>
  )
};

export const SpinnerInContext: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="p-4 border border-gray-200 rounded-lg text-center flex flex-col items-center">
        <h4 className="font-medium mb-2">컨텐츠 로딩 중...</h4>
        <p className="text-sm text-gray-600 mb-4">
          데이터를 불러오는 중입니다. 잠시만 기다려주세요.
        </p>
        <div className="flex justify-center">
          <LoadingCircles />
        </div>
      </div>

      <div className="p-4 border border-gray-200 rounded-lg text-center flex flex-col items-center">
        <h4 className="font-medium mb-2">파일 업로드 중...</h4>
        <p className="text-sm text-gray-600 mb-4">
          파일이 업로드되고 있습니다.
        </p>
        <div className="flex justify-center">
          <RoundSpinner />
        </div>
      </div>
    </div>
  )
};

export const CustomSizes: Story = {
  render: () => (
    <div className="space-y-6 flex flex-col items-center">
      <div className="flex flex-col items-center text-center">
        <h3 className="text-lg font-medium mb-2">작은 크기</h3>
        <LoadingCircles size="sm" />
      </div>

      <div className="flex flex-col items-center text-center">
        <h3 className="text-lg font-medium mb-2">기본 크기</h3>
        <LoadingCircles size="md" />
      </div>

      <div className="flex flex-col items-center text-center">
        <h3 className="text-lg font-medium mb-2">큰 크기</h3>
        <LoadingCircles size="lg" />
      </div>
    </div>
  )
};

export const LoadingStates: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">데이터 로딩</h4>
            <p className="text-sm text-gray-600">
              사용자 정보를 불러오는 중...
            </p>
          </div>
          <LoadingCircles />
        </div>
      </div>

      <div className="p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">파일 처리</h4>
            <p className="text-sm text-gray-600">이미지를 업로드하는 중...</p>
          </div>
          <RoundSpinner />
        </div>
      </div>

      <div className="p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">API 호출</h4>
            <p className="text-sm text-gray-600">서버와 통신하는 중...</p>
          </div>
          <LoadingCircles />
        </div>
      </div>
    </div>
  )
};
