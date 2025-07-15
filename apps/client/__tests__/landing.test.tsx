jest.mock("next/router", () => ({
  useRouter() {
    return {
      push: jest.fn(),
    };
  },
}));
import "@testing-library/jest-dom";
import { screen } from "@testing-library/react";
import Home from "@/pages";
import { renderWithProviders } from "@/utils/test-utils";

describe("랜딩 페이지 렌더링 테스트", () => {
  it("정상적으로 렌더링 되는지 테스트", () => {
    renderWithProviders(<Home />);
    expect(screen.getByText("새로운 기준")).toBeInTheDocument();
  });

  it("네비게이션 링크가 올바르게 렌더링 되는지 테스트", () => {
    renderWithProviders(<Home />);
    const homeLink = screen.getAllByText("홈");
    const interviewsLink = screen.getAllByText("면접");

    expect(homeLink[0]).toBeInTheDocument();
    expect(interviewsLink[0]).toBeInTheDocument();
  });
});

describe("랜딩 페이지 링크 테스트", () => {
  it("모든 네비게이션 링크가 올바른 경로를 가지는지 테스트", () => {
    renderWithProviders(<Home />);

    // 각 링크의 href 속성 확인
    expect(screen.getAllByRole("link", { name: "홈" })[0]).toHaveAttribute(
      "href",
      "/"
    );

    expect(screen.getAllByRole("link", { name: "홈" })[1]).toHaveAttribute(
      "href",
      "/"
    );
    expect(screen.getAllByRole("link", { name: "면접" })[0]).toHaveAttribute(
      "href",
      "/interviews"
    );
    expect(screen.getAllByRole("link", { name: "면접" })[1]).toHaveAttribute(
      "href",
      "/interviews"
    );
    expect(
      screen.getByRole("link", { name: "면접 연습 시작하기" })
    ).toHaveAttribute("href", "/interviews");
  });

  it("링크가 접근 가능한 상태인지 테스트", () => {
    renderWithProviders(<Home />);
    const link = screen.getByRole("link", { name: "면접 연습 시작하기" });

    expect(link).toBeEnabled();
    expect(link).toBeVisible();
  });
});
