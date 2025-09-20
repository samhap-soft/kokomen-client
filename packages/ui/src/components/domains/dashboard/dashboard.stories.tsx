import StreakCalendar from "./streak";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "domains/dashboard",
  decorators: [
    (Story) => (
      <div className="max-w-xl mx-auto">
        <Story />
      </div>
    )
  ],
  parameters: {
    layout: "fullscreen"
  },
  tags: ["autodocs"]
};

export default meta;
type Story = StoryObj<typeof meta>;

export const StreakComponent: Story = {
  render: () => {
    return (
      <StreakCalendar
        streak={{
          max_streak: 3,
          current_streak: 2,
          daily_counts: [
            { date: "2025-01-01", count: 1 },
            { date: "2025-01-02", count: 2 },
            { date: "2025-01-03", count: 3 }
          ]
        }}
        startDate="2025-01-01"
      />
    );
  }
};
