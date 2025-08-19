import LoginPage from "@/pages/login";
import KakaoCallbackPage from "@/pages/login/callback";
import { render, screen, waitFor } from "@testing-library/react";
import { server } from "@/mocks";
import { delay, http, HttpResponse } from "msw";
import { renderWithProviders } from "@/utils/test-utils";
import "@testing-library/jest-dom";
import { mockReplace } from "jest.setup";

describe("Oauth 카카오 로그인 테스트", () => {
  it("카카오 로그인 버튼이 렌더링 되는지 테스트", () => {
    render(<LoginPage />);
    const kakaoLoginButton = screen.getByRole("link", {
      name: "카카오로 시작하기"
    });
    expect(kakaoLoginButton).toBeInTheDocument();
  });
});

describe("로그인 페이지가 제대로 이동하는지 테스트", () => {
  it("로그인 페이지가 올바른 URL로 이동하는지 테스트", () => {
    renderWithProviders(<LoginPage />);
    const kakaoLoginButton = screen.getByRole("link", {
      name: "카카오로 시작하기"
    });
    expect(kakaoLoginButton).toHaveAttribute(
      "href",
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/kakao-login?redirectUri=${process.env.NEXT_PUBLIC_BASE_URL}/login/callback&state=/`
    );
  });
});

describe("Oauth 로그인 버튼 누른 후 리다이렉트 페이지 테스트", () => {
  it("각 단계별 상태 ui가 렌더링되는지 확인하는 테스트", async () => {
    server.use(
      http.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/kakao-login`,
        async () => {
          await delay(1000);
          return HttpResponse.json({ id: 1, nickname: "testUser" });
        }
      )
    );

    renderWithProviders(
      <KakaoCallbackPage code="testCode" state="testState" />
    );

    await waitFor(() => {
      expect(screen.getByText("로그인 처리 중...")).toBeInTheDocument();
    });

    // 3. 로딩 완료 후 성공 상태로 변경
    await waitFor(
      () => {
        expect(screen.getByText("로그인 완료!")).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it("API 호출이 완료되었을 때 정상적인 ui가 렌더링되는지 확인", async () => {
    server.use(
      http.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/kakao-login`,
        () => {
          return HttpResponse.json({ success: true });
        }
      )
    );

    renderWithProviders(
      <KakaoCallbackPage code="testCode" state="testState" />
    );

    await waitFor(() => {
      expect(screen.getByText("로그인 완료!")).toBeInTheDocument();
    });
  });

  it("API 호출 이후 mockReplace가 실행되는지 확인", async () => {
    server.use(
      http.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/kakao-login`,
        () => {
          return HttpResponse.json({
            id: 1,
            nickname: "오상훈",
            profile_completed: true
          });
        }
      )
    );

    renderWithProviders(
      <KakaoCallbackPage code="testCode" state="testState" />
    );

    // replace가 호출되었는지 확인
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalled();
    });
  });
});
