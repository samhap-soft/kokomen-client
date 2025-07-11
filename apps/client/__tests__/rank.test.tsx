import RankCard from "@/domains/members/components/rankCard";
import { server } from "@/mocks";
import { renderWithProviders } from "@/utils/test-utils";
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import { mockPush } from "jest.setup";
import { http, HttpResponse } from "msw";
const mockRankList = [
  {
    id: 1,
    nickname: "test1",
    score: 100,
    finished_interview_count: 10,
  },
  {
    id: 2,
    nickname: "test2",
    score: 99,
    finished_interview_count: 10,
  },
  {
    id: 3,
    nickname: "test3",
    score: 98,
    finished_interview_count: 10,
  },
  {
    id: 4,
    nickname: "test4",
    score: 97,
    finished_interview_count: 10,
  },
];
describe("랭크 페이지 테스트", () => {
  it("랭크 페이지가 렌더링 되는지 테스트", async () => {
    server.use(
      http.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/members/ranking`,
        async () => {
          return HttpResponse.json(mockRankList, { status: 200 });
        }
      )
    );
    renderWithProviders(<RankCard />);
    await waitFor(() => {
      expect(screen.getByText("test1")).toBeInTheDocument();
      expect(screen.getByText("test2")).toBeInTheDocument();
      expect(screen.getByText("test3")).toBeInTheDocument();
      expect(screen.getByText("test4")).toBeInTheDocument();
    });
  });
  it("랭크 페이지에서 각 랭커들을 눌렀을 때 랭커들의 페이지로 이동하는지 테스트", async () => {
    server.use(
      http.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/members/ranking?page=0&size=10`,
        async () => {
          return HttpResponse.json(mockRankList, { status: 200 });
        }
      )
    );
    renderWithProviders(<RankCard />);
    await waitFor(() => {
      expect(screen.getByText("test1")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("test1"));
    expect(mockPush).toHaveBeenCalledWith("/members/1");
  });
});
