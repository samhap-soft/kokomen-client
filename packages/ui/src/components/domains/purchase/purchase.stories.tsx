import Token from "./token";
import TokenHistory from "./tokenHistory";
import { Meta } from "@storybook/react";

const meta: Meta = {
  title: "Domains/Purchase",
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

export const TokenComponent = {
  render: () => {
    return (
      <div className="flex flex-col gap-4 w-full">
        <Token count={10} product_name="Token" unit_price={100} />
        <Token count={30} product_name="Token" unit_price={100} />
        <Token count={50} product_name="Token" unit_price={100} />
        <Token count={100} product_name="Token" unit_price={100} />
      </div>
    );
  }
};
export const TokenHistoryComponent = {
  render: () => {
    return (
      <div className="flex flex-col gap-4 w-full">
        <TokenHistory
          count={10}
          product_name="Token"
          unit_price={100}
          id={1}
          total_amount={100}
          remaining_count={10}
          state="사용 중"
        />
      </div>
    );
  }
};
