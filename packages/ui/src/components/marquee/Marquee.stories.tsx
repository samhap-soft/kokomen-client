import { Marquee, MarqueeItem } from "./index";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Marquee> = {
  title: "Common/Marquee",
  component: Marquee,
  parameters: {
    layout: "fullscreen"
  },
  tags: ["autodocs"],
  argTypes: {
    duration: {
      control: { type: "number", min: 5, max: 60, step: 5 },
      description: "Animation duration in seconds"
    },
    direction: {
      control: { type: "radio" },
      options: ["left", "right"],
      description: "Scroll direction"
    },
    pauseOnHover: {
      control: "boolean",
      description: "Pause animation on hover"
    },
    gap: {
      control: { type: "number", min: 0, max: 100, step: 10 },
      description: "Gap between items in pixels"
    }
  }
};

export default meta;

type Story = StoryObj<typeof Marquee>;

const generateItems = (count: number): React.ReactElement => (
  <>
    {Array.from({ length: count }, (_, i) => (
      <MarqueeItem key={i}>
        <div className="px-8 py-4 bg-gray-100 rounded-lg text-gray-800 font-medium">
          Item {i + 1}
        </div>
      </MarqueeItem>
    ))}
  </>
);

export const Default: Story = {
  args: {
    duration: 20,
    direction: "left",
    pauseOnHover: false,
    gap: 20,
    children: generateItems(2)
  }
};

export const RightDirection: Story = {
  args: {
    duration: 20,
    direction: "right",
    gap: 20,
    children: generateItems(5)
  }
};

export const FastSpeed: Story = {
  args: {
    duration: 10,
    direction: "left",
    gap: 20,
    children: generateItems(5)
  }
};

export const SlowSpeed: Story = {
  args: {
    duration: 40,
    direction: "left",
    gap: 20,
    children: generateItems(5)
  }
};

export const WithLogos: Story = {
  args: {
    duration: 25,
    direction: "left",
    gap: 40,
    children: (
      <>
        <MarqueeItem>
          <div className="flex items-center justify-center w-32 h-16 bg-blue-100 rounded-lg text-blue-600 font-bold">
            Logo 1
          </div>
        </MarqueeItem>
        <MarqueeItem>
          <div className="flex items-center justify-center w-32 h-16 bg-green-100 rounded-lg text-green-600 font-bold">
            Logo 2
          </div>
        </MarqueeItem>
        <MarqueeItem>
          <div className="flex items-center justify-center w-32 h-16 bg-purple-100 rounded-lg text-purple-600 font-bold">
            Logo 3
          </div>
        </MarqueeItem>
        <MarqueeItem>
          <div className="flex items-center justify-center w-32 h-16 bg-red-100 rounded-lg text-red-600 font-bold">
            Logo 4
          </div>
        </MarqueeItem>
        <MarqueeItem>
          <div className="flex items-center justify-center w-32 h-16 bg-yellow-100 rounded-lg text-yellow-600 font-bold">
            Logo 5
          </div>
        </MarqueeItem>
      </>
    )
  }
};

export const WithText: Story = {
  args: {
    duration: 30,
    direction: "left",
    gap: 50,
    children: (
      <>
        <MarqueeItem>
          <span className="text-2xl font-bold text-gray-800">
            🚀 Amazing Product
          </span>
        </MarqueeItem>
        <MarqueeItem>
          <span className="text-2xl font-bold text-gray-800">
            ✨ Great Features
          </span>
        </MarqueeItem>
        <MarqueeItem>
          <span className="text-2xl font-bold text-gray-800">
            💡 Innovation
          </span>
        </MarqueeItem>
        <MarqueeItem>
          <span className="text-2xl font-bold text-gray-800">
            🎯 Best Choice
          </span>
        </MarqueeItem>
        <MarqueeItem>
          <span className="text-2xl font-bold text-gray-800">
            🏆 Award Winning
          </span>
        </MarqueeItem>
      </>
    )
  }
};

export const WithCards: Story = {
  args: {
    duration: 35,
    direction: "left",
    gap: 30,
    children: (
      <>
        {Array.from({ length: 4 }, (_, i) => (
          <MarqueeItem key={i}>
            <div className="w-64 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="text-lg font-bold text-gray-900 mb-2">
                Card Title {i + 1}
              </div>
              <div className="text-sm text-gray-600">
                This is a sample card content that demonstrates how cards look
                in a marquee.
              </div>
            </div>
          </MarqueeItem>
        ))}
      </>
    )
  }
};

export const NoGap: Story = {
  args: {
    duration: 20,
    direction: "left",
    gap: 0,
    children: (
      <>
        {Array.from({ length: 8 }, (_, i) => (
          <MarqueeItem key={i}>
            <div className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium">
              Continuous Item {i + 1}
            </div>
          </MarqueeItem>
        ))}
      </>
    )
  }
};

export const LargeGap: Story = {
  args: {
    duration: 25,
    direction: "left",
    gap: 80,
    children: generateItems(4)
  }
};
