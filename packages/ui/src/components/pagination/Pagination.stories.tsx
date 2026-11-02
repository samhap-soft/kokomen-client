import { Pagination } from "./index";
import { Meta, StoryObj } from "@storybook/react";
import { JSX, useState } from "react";

const meta: Meta<typeof Pagination> = {
  title: "Common/Pagination",
  component: Pagination,
  parameters: {
    layout: "centered"
  },
  tags: ["autodocs"]
};

export default meta;

type Story = StoryObj<typeof Pagination>;

const Controlled = ({
  totalPages,
  hasNext
}: {
  totalPages?: number;
  hasNext?: boolean;
}): JSX.Element => {
  const [page, setPage] = useState<number>(0);
  return (
    <Pagination
      currentPage={page}
      totalPages={totalPages}
      hasNext={hasNext ?? page < 2}
      onPageChange={setPage}
    />
  );
};

/** Figma position=first. 첫 페이지라 이전 화살표가 비활성이다. */
export const First: Story = {
  render: () => <Controlled totalPages={2} />
};

/** 페이지가 많을 때는 현재 페이지를 가운데에 두고 5개까지 보여준다. */
export const Overflow: Story = {
  render: () => <Controlled totalPages={12} />
};

/** 전체 개수를 모르는 목록. 현재 번호와 이전/다음만 보여준다. */
export const WithoutTotal: Story = {
  render: () => <Controlled />
};
