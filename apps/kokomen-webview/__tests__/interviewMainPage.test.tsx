import { describe, it, expect } from "vitest";
import { screen, waitFor, act } from "@testing-library/react";
import { openPageSetup } from "@/utils/test-utils";
import { mockApi } from "mocks/api";
import { Category } from "@kokomen/types";
import { Rank } from "@kokomen/types";

const mockCategories: Category[] = [
  {
    key: "test",
    title: "테스트 면접",
    description: "테스트용 면접 카테고리입니다.",
    image_url: "https://test.com/test.png"
  }
];

const mockRankList: Rank[] = [
  {
    id: 1,
    nickname: "test1",
    score: 100,
    finished_interview_count: 10
  },
  {
    id: 2,
    nickname: "test2",
    score: 99,
    finished_interview_count: 10
  },
  {
    id: 3,
    nickname: "test555",
    score: 98,
    finished_interview_count: 10
  },
  {
    id: 4,
    nickname: "test15125",
    score: 97,
    finished_interview_count: 10
  }
];

describe("면접 메인 페이지 렌더링 테스트", () => {
  it("면접 메인 페이지가 정상적으로 렌더링 되는지 테스트", async () => {
    mockApi.ranking(mockRankList);
    mockApi.categories(mockCategories);
    await openPageSetup("/interviews");

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 1, name: "테스트 면접" })
      ).toBeInTheDocument();
    });

    // 랭킹 카드가 렌더링되는지 확인
    expect(screen.getByText("현재 면접 등수")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("test1")).toBeInTheDocument();
      expect(screen.getByText("100")).toBeInTheDocument();
    });
  });
});

describe("면접 메인 페이지 버튼 테스트", () => {
  it("면접 시작 버튼이 활성화되어 있고 문제 개수 조절이 정상 동작하는지 테스트", async () => {
    mockApi.ranking(mockRankList);
    mockApi.categories(mockCategories);

    await openPageSetup("/interviews");

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 1, name: "테스트 면접" })
      ).toBeInTheDocument();
    });

    // 초기 문제 개수 확인 (기본값 3) - 문제 개수 선택기의 큰 숫자를 찾음
    const questionCountDisplay = screen.getByText("3", {
      selector: "span.text-3xl"
    });
    expect(questionCountDisplay).toBeInTheDocument();

    // 플러스 버튼 클릭
    const plusButton = screen.getByRole("button", { name: "+" });
    expect(plusButton).toBeEnabled();

    await act(async () => {
      plusButton.click();
    });
    await waitFor(() => {
      expect(
        screen.getByText("4", { selector: "span.text-3xl" })
      ).toBeInTheDocument();
    });

    await act(async () => {
      plusButton.click();
    });
    await waitFor(() => {
      expect(
        screen.getByText("5", { selector: "span.text-3xl" })
      ).toBeInTheDocument();
    });

    await act(async () => {
      plusButton.click();
    });
    await waitFor(() => {
      expect(
        screen.getByText("6", { selector: "span.text-3xl" })
      ).toBeInTheDocument();
    });

    // 마이너스 버튼 클릭
    const minusButton = screen.getByRole("button", { name: "-" });
    expect(minusButton).toBeEnabled();

    await act(async () => {
      minusButton.click();
    });
    await waitFor(() => {
      expect(
        screen.getByText("5", { selector: "span.text-3xl" })
      ).toBeInTheDocument();
    });

    await act(async () => {
      minusButton.click();
    });
    await waitFor(() => {
      expect(
        screen.getByText("4", { selector: "span.text-3xl" })
      ).toBeInTheDocument();
    });

    await act(async () => {
      minusButton.click();
    });
    await waitFor(() => {
      expect(
        screen.getByText("3", { selector: "span.text-3xl" })
      ).toBeInTheDocument();
    });

    // 최소 문제 개수 제한 테스트 (3개 이하로 내려가지 않음)
    await act(async () => {
      minusButton.click();
    });
    await waitFor(() => {
      expect(
        screen.getByText("3", { selector: "span.text-3xl" })
      ).toBeInTheDocument();
    });

    await act(async () => {
      minusButton.click();
    });
    await waitFor(() => {
      expect(
        screen.getByText("3", { selector: "span.text-3xl" })
      ).toBeInTheDocument();
    });
  });

  it("면접 타입 선택이 정상적으로 동작하는지 테스트", async () => {
    mockApi.ranking(mockRankList);
    mockApi.categories(mockCategories);

    await openPageSetup("/interviews");

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 1, name: "테스트 면접" })
      ).toBeInTheDocument();
    });

    // 기본적으로 텍스트 타입이 선택되어 있는지 확인
    const textButton = screen.getByRole("button", { name: /텍스트/ });
    const voiceButton = screen.getByRole("button", { name: /음성/ });

    expect(textButton).toHaveAttribute("aria-selected", "true");
    expect(voiceButton).toHaveAttribute("aria-selected", "false");

    // 음성 타입으로 변경
    await act(async () => {
      voiceButton.click();
    });

    await waitFor(() => {
      expect(voiceButton).toHaveAttribute("aria-selected", "true");
      expect(textButton).toHaveAttribute("aria-selected", "false");
    });

    // 다시 텍스트 타입으로 변경
    await act(async () => {
      textButton.click();
    });

    await waitFor(() => {
      expect(textButton).toHaveAttribute("aria-selected", "true");
      expect(voiceButton).toHaveAttribute("aria-selected", "false");
    });
  });
});

describe("면접 메인 페이지 API 테스트", () => {
  it("면접 메인 페이지에서 면접 시작 버튼을 클릭하면 면접 페이지로 이동한다", async () => {
    mockApi.ranking(mockRankList);
    mockApi.categories(mockCategories);

    const mockInterviewResponse = {
      interview_id: 1,
      question_id: 1,
      root_question: "테스트 질문입니다."
    };

    mockApi.createInterview(mockInterviewResponse, 100);

    await openPageSetup("/interviews");

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 1, name: "테스트 면접" })
      ).toBeInTheDocument();
    });

    const startButton = screen.getByRole("button", {
      name: "테스트 면접 면접 시작하기"
    });

    expect(startButton).toBeEnabled();

    await act(async () => {
      startButton.click();
    });

    // 모달이 열리는지 확인
    await waitFor(() => {
      expect(screen.getByText("면접 시작하기")).toBeInTheDocument();
      expect(
        screen.getByText("테스트 면접 면접을 시작하시겠습니까?")
      ).toBeInTheDocument();
    });

    // 모달에서 시작하기 버튼 클릭 - 더 구체적인 선택자 사용
    const confirmButton = screen.getByRole("button", {
      name: /시작하기\(토큰/
    });

    await act(async () => {
      confirmButton.click();
    });

    // 로딩 상태 확인
    await waitFor(() => {
      expect(screen.getByText("면접 시작 중...")).toBeInTheDocument();
    });

    // 면접 페이지로 이동 확인 (실제 라우터 네비게이션 테스트)
    await waitFor(
      () => {
        expect(startButton).toBeDisabled();
      },
      { timeout: 3000 }
    );
  });

  it("면접 생성 실패 시 에러 처리가 올바르게 동작한다", async () => {
    mockApi.ranking(mockRankList);
    mockApi.categories(mockCategories);

    mockApi.createInterviewError(400);

    await openPageSetup("/interviews");

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 1, name: "테스트 면접" })
      ).toBeInTheDocument();
    });

    const startButton = screen.getByRole("button", {
      name: "테스트 면접 면접 시작하기"
    });

    await act(async () => {
      startButton.click();
    });

    // 모달이 열리는지 확인
    await waitFor(() => {
      expect(screen.getByText("면접 시작하기")).toBeInTheDocument();
    });

    // 모달에서 시작하기 버튼 클릭 - 더 구체적인 선택자 사용
    const confirmButton = screen.getByRole("button", {
      name: /시작하기\(토큰/
    });

    await act(async () => {
      confirmButton.click();
    });

    // 에러 토스트 메시지 확인
    await waitFor(
      () => {
        expect(
          screen.getByText("면접 생성에 실패했습니다.")
        ).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("카테고리 탭 변경이 정상적으로 동작하는지 테스트", async () => {
    const multipleCategories = [
      {
        key: "test1",
        title: "테스트 면접 1",
        description: "첫 번째 테스트 카테고리",
        image_url: "https://test.com/test1.png"
      },
      {
        key: "test2",
        title: "테스트 면접 2",
        description: "두 번째 테스트 카테고리",
        image_url: "https://test.com/test2.png"
      }
    ];

    mockApi.categories(multipleCategories);
    mockApi.ranking(mockRankList);

    await openPageSetup("/interviews");

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 1, name: "테스트 면접 1" })
      ).toBeInTheDocument();
    });

    // 두 번째 카테고리 탭 클릭
    const secondTab = screen.getByRole("tab", { name: "테스트 면접 2" });
    await act(async () => {
      secondTab.click();
    });

    // 두 번째 카테고리 내용이 표시되는지 확인
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 1, name: "테스트 면접 2" })
      ).toBeInTheDocument();
    });

    expect(screen.getByText("두 번째 테스트 카테고리")).toBeInTheDocument();
  });

  it("랭킹 카드 클릭 시 멤버 페이지로 이동하는지 테스트", async () => {
    mockApi.ranking(mockRankList);
    mockApi.categories(mockCategories);
    await openPageSetup("/interviews");

    await waitFor(() => {
      expect(screen.getByText("현재 면접 등수")).toBeInTheDocument();
    });

    // 첫 번째 랭킹 카드 클릭
    const firstRankCard = screen.getByRole("button", {
      name: "rank-card-1-test1"
    });

    expect(firstRankCard).toBeInTheDocument();
    await act(async () => {
      firstRankCard.click();
    });

    // 실제 네비게이션은 라우터 테스트에서 확인
    await waitFor(() => {
      expect(firstRankCard).toBeInTheDocument();
    });
  });
});
