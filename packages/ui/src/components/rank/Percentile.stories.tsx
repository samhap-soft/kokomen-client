import type { Meta, StoryObj } from "@storybook/react";
import { Percentile } from "./index";

const meta: Meta<typeof Percentile> = {
  title: "Components/Rank/Percentile",
  component: Percentile,
  parameters: {
    layout: "centered"
  },
  tags: ["autodocs"],
  argTypes: {
    rank: {
      control: { type: "number", min: 1 }
    },
    totalMemberCount: {
      control: { type: "number", min: 1 }
    }
  }
};

export default meta;
type PercentileStory = StoryObj<typeof meta>;
export const Top1Percent: PercentileStory = {
  args: {
    rank: 1,
    totalMemberCount: 100
  }
};

export const Top10Percent: PercentileStory = {
  args: {
    rank: 10,
    totalMemberCount: 100
  }
};

export const Top25Percent: PercentileStory = {
  args: {
    rank: 25,
    totalMemberCount: 100
  }
};

export const Top50Percent: PercentileStory = {
  args: {
    rank: 50,
    totalMemberCount: 100
  }
};

export const Top75Percent: PercentileStory = {
  args: {
    rank: 75,
    totalMemberCount: 100
  }
};

export const Top90Percent: PercentileStory = {
  args: {
    rank: 90,
    totalMemberCount: 100
  }
};

export const Top95Percent: PercentileStory = {
  args: {
    rank: 95,
    totalMemberCount: 100
  }
};
