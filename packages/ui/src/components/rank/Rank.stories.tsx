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
