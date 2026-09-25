import type { Meta, StoryObj } from "@storybook/react";
import { Score } from "./index";

const meta: Meta<typeof Score> = {
  title: "Components/Rank/Score",
  component: Score,
  parameters: {
    layout: "centered"
  },
  tags: ["autodocs"],
  argTypes: {
    rank: {
      control: { type: "select" },
      options: ["A", "B", "C", "D", "F"]
    }
  }
};

export default meta;
type ScoreStory = StoryObj<typeof meta>;
export const GradeA: ScoreStory = {
  args: {
    rank: "A"
  }
};

export const GradeB: ScoreStory = {
  args: {
    rank: "B"
  }
};

export const GradeC: ScoreStory = {
  args: {
    rank: "C"
  }
};

export const GradeD: ScoreStory = {
  args: {
    rank: "D"
  }
};

export const GradeF: ScoreStory = {
  args: {
    rank: "F"
  }
};
