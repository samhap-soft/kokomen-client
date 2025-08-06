import type { Meta, StoryObj } from "@storybook/react";
import { Rank, Percentile, Score } from "./index";

const meta: Meta<typeof Rank> = {
  title: "Components/Rank",
  component: Rank,
  parameters: {
    layout: "centered"
  },
  tags: ["autodocs"],
  argTypes: {
    rank: {
      control: { type: "number", min: 1 }
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstPlace: Story = {
  args: {
    rank: 1
  }
};

export const SecondPlace: Story = {
  args: {
    rank: 2
  }
};

export const ThirdPlace: Story = {
  args: {
    rank: 3
  }
};

export const TopTen: Story = {
  args: {
    rank: 5
  }
};

export const RegularRank: Story = {
  args: {
    rank: 15
  }
};

export const HighRank: Story = {
  args: {
    rank: 25
  }
};

// Percentile 컴포넌트 스토리
const PercentileMeta: Meta<typeof Percentile> = {
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

type PercentileStory = StoryObj<typeof Percentile>;
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

// Score 컴포넌트 스토리
const ScoreMeta: Meta<typeof Score> = {
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
type ScoreStory = StoryObj<typeof Score>;
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

// 모든 랭킹 컴포넌트를 보여주는 스토리
export const AllRankComponents: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Rank 컴포넌트</h3>
        <div className="flex gap-2 flex-wrap">
          <Rank rank={1} />
          <Rank rank={2} />
          <Rank rank={3} />
          <Rank rank={5} />
          <Rank rank={15} />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Percentile 컴포넌트</h3>
        <div className="flex gap-2 flex-wrap">
          <Percentile rank={1} totalMemberCount={100} />
          <Percentile rank={10} totalMemberCount={100} />
          <Percentile rank={25} totalMemberCount={100} />
          <Percentile rank={50} totalMemberCount={100} />
          <Percentile rank={75} totalMemberCount={100} />
          <Percentile rank={90} totalMemberCount={100} />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Score 컴포넌트</h3>
        <div className="flex gap-2 flex-wrap">
          <Score rank="A" />
          <Score rank="B" />
          <Score rank="C" />
          <Score rank="D" />
          <Score rank="F" />
        </div>
      </div>
    </div>
  )
};
