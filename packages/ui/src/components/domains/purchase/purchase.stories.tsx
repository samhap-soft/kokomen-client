import Token from "./token";
import TokenHistory, { TokenHistoryHeader } from "./tokenHistory";
import { Meta } from "@storybook/react";
import { Button } from "../../button";

const meta: Meta = {
  title: "Domains/Purchase",
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-[1182px] overflow-x-auto p-4">
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
      <div className="flex w-full flex-col gap-2">
        <Token orderName="토큰 10개" productName="Token" price={500} />
        <Token orderName="토큰 20개" productName="Token" price={1000} />
        <Token orderName="토큰 50개" productName="Token" price={2500} />
        <Token orderName="토큰 100개" productName="Token" price={5000} />
        <Token orderName="토큰 200개" productName="Token" price={10000} />
      </div>
    );
  }
};

/** Figma 747:1749 의 미사용 · 사용 중 · 사용 완료 3종 */
export const TokenHistoryComponent = {
  render: () => {
    return (
      <div className="min-w-[1182px]">
        <TokenHistoryHeader />
        <TokenHistory
          id={1}
          price={10000}
          orderName="토큰 200개"
          productName="Token"
          remainingCount={200}
          state="환불 가능"
          count={200}
          paymentMethod="간편결제"
          easyPayProvider="카카오페이"
          purchasedAt="2026-10-30T12:00:00"
          RefundComponent={<Button variant="secondary">환불하기</Button>}
        />
        <TokenHistory
          id={2}
          price={10000}
          orderName="토큰 200개"
          productName="Token"
          remainingCount={120}
          state="사용 중"
          count={200}
          paymentMethod="간편결제"
          easyPayProvider="카카오페이"
          purchasedAt="2026-10-30T12:00:00"
          RefundComponent={null}
        />
        <TokenHistory
          id={3}
          price={10000}
          orderName="토큰 200개"
          productName="Token"
          remainingCount={0}
          state="사용 완료"
          count={200}
          paymentMethod="카드"
          RefundComponent={null}
        />
      </div>
    );
  }
};
