import Token from "./token";
import TokenHistory from "./tokenHistory";
import { Meta } from "@storybook/react";
import { Button } from "../../button";

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
        <Token orderName="토큰 10개" productName="Token" price={10} />
        <Token orderName="토큰 30개" productName="Token" price={30} />
        <Token orderName="토큰 50개" productName="Token" price={50} />
        <Token orderName="토큰 100개" productName="Token" price={100} />
      </div>
    );
  }
};
export const TokenHistoryComponent = {
  render: () => {
    return (
      <div className="flex flex-col gap-4 w-full">
        <TokenHistory
          id={1}
          price={100}
          orderName="토큰 10개"
          productName="Token"
          remainingCount={10}
          state="사용 중"
          count={10}
          paymentMethod="카드"
          RefundComponent={<Button>환불하기</Button>}
        />
        <TokenHistory
          id={1}
          price={100}
          orderName="토큰 10개"
          productName="Token"
          remainingCount={10}
          state="환불 가능"
          count={10}
          paymentMethod="easypay"
          easyPayProvider="카카오페이"
          RefundComponent={
            <Button variant="warning" danger>
              환불하기
            </Button>
          }
        />
      </div>
    );
  }
};
