import "@testing-library/jest-dom";
import InterviewMainPage from "@/pages/interviews";
import { renderWithProviders } from "@/utils/test-utils";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { server } from "@/mocks";
import { delay, http, HttpResponse } from "msw";
import { mockPush } from "jest.setup";

describe("면접 메인 페이지 렌더링 테스트", () => {
  it("면접 메인 페이지가 정상적으로 렌더링 되는지 테스트", () => {
    renderWithProviders(
      <InterviewMainPage
        categories={[
          {
            key: "test",
            title: "test",
            description: "test",
            image_url: "https://test.com/test.png",
          },
        ]}
        userInfo={null}
      />
    );

    expect(screen.getByText("test 면접 시작하기")).toBeInTheDocument();
  });
});

describe("면접 메인 페이지 버튼 테스트", () => {
  it("면접 시작 버튼이 활성화되어 있는지 테스트", () => {
    renderWithProviders(
      <InterviewMainPage
        categories={[
          {
            key: "test",
            title: "test",
            description: "test",
            image_url: "https://test.com/test.png",
          },
        ]}
        userInfo={null}
      />
    );
    const plusButton = screen.getByRole("button", { name: "+" });
    expect(plusButton).toBeEnabled();

    fireEvent.click(plusButton);

    expect(screen.getByText("4")).toBeInTheDocument();

    fireEvent.click(plusButton);

    expect(screen.getByText("5")).toBeInTheDocument();

    fireEvent.click(plusButton);

    expect(screen.getByText("6")).toBeInTheDocument();

    const minusButton = screen.getByRole("button", { name: "-" });

    expect(minusButton).toBeEnabled();

    fireEvent.click(minusButton);

    expect(screen.getByText("5")).toBeInTheDocument();

    fireEvent.click(minusButton);

    expect(screen.getByText("4")).toBeInTheDocument();

    fireEvent.click(minusButton);

    expect(screen.getByText("3")).toBeInTheDocument();

    //최소 문제 개수 제한 테스트
    fireEvent.click(minusButton);

    expect(screen.getByText("3")).toBeInTheDocument();

    fireEvent.click(minusButton);

    expect(screen.getByText("3")).toBeInTheDocument();
  });
});

describe("면접 메인 페이지 API 테스트", () => {
  beforeEach(() => {
    // 각 테스트 전에 mock 함수들을 초기화
    jest.clearAllMocks();
  });

  it("면접 메인 페이지에서 면접 시작 버튼을 클릭하면 면접 페이지로 이동한다.", async () => {
    server.use(
      http.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/interviews`,
        async () => {
          await delay(100);
          return HttpResponse.json({
            interview_id: 1,
            question_id: 1,
            root_question: "test",
          });
        }
      )
    );

    renderWithProviders(
      <InterviewMainPage
        categories={[
          {
            key: "test",
            title: "test",
            description: "test",
            image_url: "https://test.com/test.png",
          },
        ]}
        userInfo={null}
      />
    );

    const startButton = screen.getByRole("button", {
      name: "test 면접 시작하기",
    });

    expect(startButton).toBeEnabled();

    fireEvent.click(startButton);

    // 로딩 상태 확인
    await waitFor(() => {
      expect(screen.getByText("면접 시작 중...")).toBeInTheDocument();
    });

    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith({
          pathname: "/interviews/1",
        });
      },
      { timeout: 3000 }
    );
  });

  it("면접 생성 실패 시 에러 처리가 올바르게 동작한다.", async () => {
    server.use(
      http.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/interviews`, () => {
        return HttpResponse.json(
          { message: "면접 생성에 실패했습니다." },
          { status: 400 }
        );
      })
    );

    renderWithProviders(
      <InterviewMainPage
        categories={[
          {
            key: "test",
            title: "test",
            description: "test",
            image_url: "https://test.com/test.png",
          },
        ]}
        userInfo={null}
      />
    );

    const startButton = screen.getByRole("button", {
      name: "test 면접 시작하기",
    });

    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText("면접 생성 실패")).toBeInTheDocument();
    });
  });
});
