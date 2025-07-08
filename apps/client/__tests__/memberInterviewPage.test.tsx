import { server } from "@/mocks";
import MemberInterviewPage from "@/pages/members/[memberId]";
import { renderWithProviders } from "@/utils/test-utils";
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import { http, HttpResponse } from "msw";

describe("memberInterviewPage", () => {
  it("렌더링 기본 테스트", async () => {
    renderWithProviders(<MemberInterviewPage memberId="1" user={null} />);
    await waitFor(() => {
      expect(screen.getByText("면접 기록")).toBeInTheDocument();
    });
  });
  it("데이터 페칭에 따른 렌더링 테스트", async () => {
    server.use(
      http.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/interviews?member_id=1&page=0&size=10&sort=id,desc`,
        async () => {
          return HttpResponse.json([
            {
              interview_id: 1,
              interview_state: "FINISHED",
              interview_category: "테스트1",
              created_at: "2021-01-01",
              root_question: "면접 질문",
            },
            {
              interview_id: 2,
              interview_state: "FINISHED",
              interview_category: "테스트2",
              created_at: "2021-01-01",
              root_question: "면접 질문",
            },
          ]);
        }
      )
    );
    renderWithProviders(<MemberInterviewPage memberId="1" user={null} />);
    await waitFor(() => {
      expect(screen.getByText("테스트1")).toBeInTheDocument();
      expect(screen.getByText("테스트2")).toBeInTheDocument();
    });
  });
  it("데이터 페이지네이션 테스트", async () => {
    server.use(
      http.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/interviews?member_id=1&page=0&size=10&sort=id,desc`,
        async () => {
          return HttpResponse.json([
            {
              interview_id: 1,
              interview_state: "FINISHED",
              interview_category: "테스트1",
              created_at: "2021-01-01",
              root_question: "면접 질문",
            },
            {
              interview_id: 2,
              interview_state: "FINISHED",
              interview_category: "테스트2",
              created_at: "2021-01-01",
              root_question: "면접 질문",
            },
          ]);
        },
        { once: true }
      )
    );
    renderWithProviders(<MemberInterviewPage memberId="1" user={null} />);
    await waitFor(() => {
      expect(screen.getByText("테스트1")).toBeInTheDocument();
      expect(screen.getByText("테스트2")).toBeInTheDocument();
    });
    server.use(
      http.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/interviews?member_id=1&page=1&size=10&sort=id,desc`,
        async () => {
          return HttpResponse.json([
            {
              interview_id: 1,
              interview_state: "FINISHED",
              interview_category: "테스트3",
              created_at: "2021-01-01",
              root_question: "면접 질문",
            },
            {
              interview_id: 2,
              interview_state: "FINISHED",
              interview_category: "테스트4",
              created_at: "2021-01-01",
              root_question: "면접 질문",
            },
          ]);
        }
      )
    );
    const nextButton = screen.getByRole("button", { name: "next page" });
    fireEvent.click(nextButton);
    await waitFor(() => {
      expect(screen.getByText("테스트3")).toBeInTheDocument();
      expect(screen.getByText("테스트4")).toBeInTheDocument();
    });
  });

  it("면접 기록 데이터 없을 때 렌더링 테스트", async () => {
    server.use(
      http.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/interviews?member_id=1&page=0&size=10&sort=id,desc`,
        async () => {
          return HttpResponse.json([]);
        }
      )
    );
    renderWithProviders(<MemberInterviewPage memberId="1" user={null} />);
    await waitFor(() => {
      expect(
        screen.getByText("해당 유저의 면접 기록이 없습니다")
      ).toBeInTheDocument();
    });
  });
  it("면접 기록 데이터 에러 테스트", async () => {
    server.use(
      http.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/interviews?member_id=1&page=0&size=10&sort=id,desc`,
        async () => {
          return HttpResponse.error();
        }
      )
    );
    renderWithProviders(<MemberInterviewPage memberId="1" user={null} />);
    await waitFor(() => {
      expect(
        screen.getByText("데이터를 불러오는 중 오류가 발생했습니다.")
      ).toBeInTheDocument();
    });
  });
});
