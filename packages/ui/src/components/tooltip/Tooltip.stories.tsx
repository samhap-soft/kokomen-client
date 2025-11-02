import type { Meta, StoryObj } from "@storybook/react";
import Tooltip from "./index";

const meta: Meta<typeof Tooltip> = {
  title: "Components/Tooltip",
  component: Tooltip,
  parameters: {
    layout: "centered"
  },
  tags: ["autodocs"]
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Top: Story = {
  render: () => (
    <div className="p-20">
      <Tooltip>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          Hover me
        </button>
        <Tooltip.Content placement="top">This is a tooltip</Tooltip.Content>
      </Tooltip>
    </div>
  )
};

export const Bottom: Story = {
  render: () => (
    <div className="p-20">
      <Tooltip>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          Hover me
        </button>
        <Tooltip.Content placement="bottom">
          This is a bottom tooltip
        </Tooltip.Content>
      </Tooltip>
    </div>
  )
};

export const Left: Story = {
  render: () => (
    <div className="p-20">
      <Tooltip>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          Hover me
        </button>
        <Tooltip.Content placement="left">
          This is a left tooltip
        </Tooltip.Content>
      </Tooltip>
    </div>
  )
};

export const Right: Story = {
  render: () => (
    <div className="p-20">
      <Tooltip>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          Hover me
        </button>
        <Tooltip.Content placement="right">
          This is a right tooltip
        </Tooltip.Content>
      </Tooltip>
    </div>
  )
};

export const AllPlacements: Story = {
  render: () => (
    <div className="flex flex-col items-center justify-center gap-20 p-20">
      <div className="flex gap-8">
        <Tooltip>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            Top
          </button>
          <Tooltip.Content placement="top">Top tooltip</Tooltip.Content>
        </Tooltip>

        <Tooltip>
          <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
            Bottom
          </button>
          <Tooltip.Content placement="bottom">Bottom tooltip</Tooltip.Content>
        </Tooltip>

        <Tooltip>
          <button className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600">
            Left
          </button>
          <Tooltip.Content placement="left">Left tooltip</Tooltip.Content>
        </Tooltip>

        <Tooltip>
          <button className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600">
            Right
          </button>
          <Tooltip.Content placement="right">Right tooltip</Tooltip.Content>
        </Tooltip>
      </div>
    </div>
  )
};

export const WithIcon: Story = {
  render: () => (
    <div className="p-20">
      <Tooltip>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md">
          <span>Information</span>
          <svg
            className="w-4 h-4 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <Tooltip.Content placement="top">
          This is some helpful information
        </Tooltip.Content>
      </Tooltip>
    </div>
  )
};

export const LongContent: Story = {
  render: () => (
    <div className="p-20">
      <Tooltip>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          Hover for details
        </button>
        <Tooltip.Content placement="top">
          This is a longer tooltip with more information
        </Tooltip.Content>
      </Tooltip>
    </div>
  )
};

export const CustomStyling: Story = {
  render: () => (
    <div className="p-20">
      <Tooltip>
        <button className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600">
          Custom tooltip
        </button>
        <Tooltip.Content
          placement="top"
          className="bg-indigo-600 text-white font-semibold"
        >
          Custom styled tooltip
        </Tooltip.Content>
      </Tooltip>
    </div>
  )
};

export const MultipleTooltips: Story = {
  render: () => (
    <div className="p-20 flex gap-4">
      <Tooltip>
        <button className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
          Delete
        </button>
        <Tooltip.Content placement="top">삭제하기</Tooltip.Content>
      </Tooltip>

      <Tooltip>
        <button className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">
          Edit
        </button>
        <Tooltip.Content placement="top">수정하기</Tooltip.Content>
      </Tooltip>

      <Tooltip>
        <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
          Save
        </button>
        <Tooltip.Content placement="top">저장하기</Tooltip.Content>
      </Tooltip>
    </div>
  )
};
