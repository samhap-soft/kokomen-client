import { server } from "@/mocks";
import KakaoCallbackPage from "@/pages/login/callback";
import { renderWithProviders } from "@/utils/test-utils";
import { waitFor } from "@testing-library/dom";
import { mockReplace } from "jest.setup";
import { delay, http, HttpResponse } from "msw";

describe("profile setting 페이지 이동 테스트", () => {
  it("로그인 페이지에서 프로필 설정 페이지로 이동하는지 테스트", async () => {
    server.use(
      http.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/kakao-login`,
        async () => {
          await delay(100);
          return HttpResponse.json({
            id: 1,
            nickname: "오상훈",
            profile_completed: false,
          });
        }
      )
    );
    renderWithProviders(<KakaoCallbackPage code="1234567890" state="test" />);
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/login/profile", {
        query: {
          redirectTo: "test",
        },
      });
    });
  });
});
