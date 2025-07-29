import { describe, it, expect } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { openPageSetup } from "@/utils/test-utils";
import { mockApi } from "mocks/api";
import { server } from "mocks";
import { http, HttpResponse } from "msw";
import { mockMemberInterviewData } from "mocks/api/members";

describe("다른 사용자들 면접 기록 페이지 테스트", () => {
  it("면접 기록 페이지가 올바르게 렌더링되는지 테스트", async () => {
    mockApi.memberInterviews();
    await openPageSetup("/members/1");

    await waitFor(() => {
      expect(screen.getByText("면접 기록")).toBeInTheDocument();
    });

    // 멤버 정보가 표시되는지 확인
    expect(screen.getByText("test")).toBeInTheDocument();
    expect(screen.getByText("100명 중")).toBeInTheDocument();
  });

  it("면접 기록 데이터가 올바르게 표시되는지 테스트", async () => {
    mockApi.memberInterviews();
    await openPageSetup("/members/1");

    await waitFor(() => {
      expect(screen.getByText("테스트1")).toBeInTheDocument();
      expect(screen.getByText("테스트2")).toBeInTheDocument();
    });

    // 면접 질문이 표시되는지 확인
    expect(screen.getByText("면접 질문 검증용")).toBeInTheDocument();

    // 점수와 조회수, 좋아요 수가 표시되는지 확인
    expect(screen.getByText("20점")).toBeInTheDocument();
    expect(screen.getByText("111")).toBeInTheDocument(); // 좋아요 수
  });

  it("면접 기록이 없을 때 빈 상태 메시지가 표시되는지 테스트", async () => {
    mockApi.memberInterviews();
    await openPageSetup("/members/2");

    await waitFor(() => {
      expect(
        screen.getByText("해당 유저의 면접 기록이 없습니다")
      ).toBeInTheDocument();
    });
  });

  it("정렬 옵션이 올바르게 작동하는지 테스트", async () => {
    mockApi.memberInterviews();
    await openPageSetup("/members/1");

    await waitFor(() => {
      expect(screen.getByText("면접 기록")).toBeInTheDocument();
    });

    // 정렬 드롭다운이 존재하는지 확인
    const sortSelect = screen.getByText("최신순");
    expect(sortSelect).toBeInTheDocument();
  });

  it("인터뷰 조회하기 버튼이 올바르게 표시되는지 테스트", async () => {
    mockApi.memberInterviews();
    await openPageSetup("/members/1");

    await waitFor(() => {
      expect(screen.getByText("테스트1")).toBeInTheDocument();
    });

    // 인터뷰 조회하기 버튼들이 존재하는지 확인
    const viewButtons = screen.getAllByText("인터뷰 조회하기");
    expect(viewButtons).toHaveLength(2);
  });

  it("API 에러 시 에러 메시지가 표시되는지 테스트", async () => {
    // 존재하지 않는 유저에 대한 404 에러를 시뮬레이션
    server.use(
      http.get(
        `${import.meta.env.VITE_API_BASE_URL}/interviews`,
        ({ request }) => {
          const url = new URL(request.url);
          const memberId = url.searchParams.get("member_id");

          // memberId가 "999"인 경우 404 에러 반환
          if (memberId === "999") {
            return HttpResponse.json(
              { message: "존재하지 않는 유저입니다" },
              { status: 404 }
            );
          }

          // 다른 경우는 기본 mock 데이터 반환
          return HttpResponse.json(mockMemberInterviewData);
        }
      )
    );

    await openPageSetup("/members/999");

    // 로딩이 완료되고 에러 메시지가 표시될 때까지 기다리기
    await waitFor(
      () => {
        expect(screen.getByText("존재하지 않는 유저예요")).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });
});
