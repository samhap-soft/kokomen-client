import { MemberInterview } from "@/domains/members/types";
import MemberInterviewPage from "@/pages/members/[memberId]";
import { CamelCasedProperties } from "@/utils/convertConvention";
import { renderWithProviders } from "@/utils/test-utils";
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import { mockPush } from "jest.setup";

const mockMemberInterview: CamelCasedProperties<MemberInterview> = {
  interviewSummaries: [
    {
      interviewId: 1,
      interviewCategory: "테스트1",
      createdAt: "2021-01-01",
      rootQuestion: "면접 질문",
      maxQuestionCount: 10,
      score: 20,
      interviewLikeCount: 10,
      interviewAlreadyLiked: false,
      interviewViewCount: 10,
    },
    {
      interviewId: 2,
      interviewCategory: "테스트2",
      createdAt: "2021-01-01",
      rootQuestion: "면접 질문",
      maxQuestionCount: 10,
      score: 20,
      interviewLikeCount: 10,
      interviewAlreadyLiked: false,
      interviewViewCount: 10,
    },
  ],
  intervieweeNickname: "test",
  totalMemberCount: 0,
  intervieweeRank: 0,
  totalPageCount: 1,
};

describe("memberInterviewPage", () => {
  it("렌더링 기본 테스트", async () => {
    renderWithProviders(
      <MemberInterviewPage
        memberId="1"
        user={null}
        interviews={mockMemberInterview}
        sort="desc"
        page={0}
      />
    );
    await waitFor(() => {
      expect(screen.getByText("면접 기록")).toBeInTheDocument();
    });
  });
  it("데이터 페칭에 따른 렌더링 테스트", async () => {
    renderWithProviders(
      <MemberInterviewPage
        memberId="1"
        user={null}
        interviews={mockMemberInterview}
        sort="desc"
        page={0}
      />
    );
    await waitFor(() => {
      expect(screen.getByText("테스트1")).toBeInTheDocument();
      expect(screen.getByText("테스트2")).toBeInTheDocument();
    });
  });
  it("데이터 페이지네이션 테스트", async () => {
    renderWithProviders(
      <MemberInterviewPage
        memberId="1"
        user={null}
        interviews={mockMemberInterview}
        sort="desc"
        page={1}
      />
    );
    await waitFor(() => {
      expect(screen.getByText("테스트1")).toBeInTheDocument();
      expect(screen.getByText("테스트2")).toBeInTheDocument();
    });

    const nextButton = screen.getByRole("button", { name: "next page" });
    fireEvent.click(nextButton);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/members/1?sort=desc&page=2");
    });
  });
  it("데이터 페이지네이션 테스트", async () => {
    renderWithProviders(
      <MemberInterviewPage
        memberId="1"
        user={null}
        interviews={{
          ...mockMemberInterview,
          totalPageCount: 2,
        }}
        sort="desc"
        page={1}
      />
    );
    await waitFor(() => {
      expect(screen.getByText("테스트1")).toBeInTheDocument();
      expect(screen.getByText("테스트2")).toBeInTheDocument();
    });

    const nextButton = screen.getByRole("button", { name: "next page" });
    expect(nextButton).toBeDisabled();
  });

  it("면접 기록 데이터 없을 때 렌더링 테스트", async () => {
    renderWithProviders(
      <MemberInterviewPage
        memberId="1"
        user={null}
        interviews={{ ...mockMemberInterview, interviewSummaries: [] }}
        sort="desc"
        page={0}
      />
    );
    await waitFor(() => {
      expect(
        screen.getByText("해당 유저의 면접 기록이 없습니다")
      ).toBeInTheDocument();
    });
  });
});
