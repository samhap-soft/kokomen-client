import { renderWithProviders } from "@/utils/test-utils";
import RankPage from "@/pages/rank";
import { screen, within } from "@testing-library/dom";
import { CamelCasedProperties, Rank } from "@kokomen/types";

const makeRanks = (start: number, count: number): CamelCasedProperties<Rank>[] =>
  Array.from({ length: count }, (_, index) => ({
    id: start + index,
    nickname: `회원${start + index}`,
    score: 3200 - (start + index) * 10,
    finishedInterviewCount: 1
  }));

const topRank = makeRanks(1, 3);

describe("랭킹 페이지 테스트", () => {
  it("상위 3명 카드와 프로필 링크를 보여준다", () => {
    renderWithProviders(
      <RankPage
        rankList={{
          currentPage: 0,
          totalPages: 2,
          hasNext: true,
          data: makeRanks(1, 10)
        }}
        topRank={topRank}
        userInfo={null}
        page={0}
      />
    );

    const top = screen.getByRole("region", { name: "상위 3명" });
    const links = within(top).getAllByRole("link", { name: "프로필 보기" });
    expect(links).toHaveLength(3);
    expect(links[0]).toHaveAttribute("href", "/members/1");
    expect(within(top).getByText("3,190점")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "페이지 이동" })).toBeInTheDocument();
  });

  it("2페이지의 첫 행은 11위부터 시작한다", () => {
    renderWithProviders(
      <RankPage
        rankList={{
          currentPage: 1,
          totalPages: 2,
          hasNext: false,
          data: makeRanks(11, 10)
        }}
        topRank={topRank}
        userInfo={null}
        page={1}
      />
    );

    const table = screen.getByRole("region", { name: "전체 랭킹" });
    const rows = within(table).getAllByRole("listitem");
    expect(within(rows[0]).getByText("11")).toBeInTheDocument();
    expect(within(rows[0]).getByRole("link")).toHaveAttribute(
      "href",
      "/members/11"
    );
  });

  it("랭킹 데이터가 없으면 안내 문구만 보여준다", () => {
    renderWithProviders(
      <RankPage
        rankList={{ currentPage: 0, totalPages: 0, hasNext: false, data: [] }}
        topRank={[]}
        userInfo={null}
        page={0}
      />
    );

    expect(screen.getByText("아직 랭킹 데이터가 없습니다.")).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "상위 3명" })).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "페이지 이동" })).not.toBeInTheDocument();
  });
});
