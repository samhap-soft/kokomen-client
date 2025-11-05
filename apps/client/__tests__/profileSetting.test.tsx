import { server } from "@/mocks";
import KakaoCallbackPage from "@/pages/login/callback";
import LoginProfileSetting from "@/pages/login/profile";
import { renderWithProviders } from "@/utils/test-utils";
import { fireEvent, screen, waitFor } from "@testing-library/dom";
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
            profile_completed: false
          });
        }
      )
    );
    renderWithProviders(<KakaoCallbackPage code="1234567890" state="test" />);
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/login/profile?state=test");
    });
  });
});

describe("profile setting 렌더링 테스트", () => {
  it("프로필 설정 페이지에서 제대로 유저 기본 필드값이 렌더링되는지 확인", async () => {
    renderWithProviders(
      <LoginProfileSetting
        state="/"
        userInfo={{
          id: 1,
          nickname: "오상훈",
          score: 0,
          token_count: 10,
          profile_completed: false,
          total_member_count: 10,
          rank: 1,
          is_test_user: false
        }}
      />
    );
    expect(screen.getByRole("textbox", { name: "닉네임" })).not.toHaveValue(
      "오상훈"
    );
  });
});

describe("profile setting 기능 테스트", () => {
  it("프로필 설정 페이지에서 닉네임 변경 테스트", async () => {
    server.use(
      http.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/members/me/profile`,
        async () => {
          await delay(100);
          return HttpResponse.json({}, { status: 200 });
        }
      )
    );
    renderWithProviders(
      <LoginProfileSetting
        state="/"
        userInfo={{
          id: 1,
          nickname: "오상훈",
          score: 0,
          token_count: 10,
          profile_completed: false,
          total_member_count: 10,
          rank: 1,
          is_test_user: false
        }}
      />
    );
    const nicknameInput = screen.getByRole("textbox", { name: "닉네임" });
    fireEvent.change(nicknameInput, { target: { value: "오상훈1234567" } });
    expect(nicknameInput).toHaveValue("오상훈1234567");
    const saveButton = screen.getByRole("button", { name: "저장하기" });
    fireEvent.click(saveButton);
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalled();
    });
  });
  it("프로필 설정 페이지에서 닉네임 변경 실패 테스트", async () => {
    server.use(
      http.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/members/me/profile`,
        async () => {
          await delay(100);
          return HttpResponse.json(
            { message: "닉네임 변경에 실패 테스트" },
            { status: 400 }
          );
        }
      )
    );
    renderWithProviders(
      <LoginProfileSetting
        state="/"
        userInfo={{
          id: 1,
          nickname: "오상훈",
          score: 0,
          token_count: 10,
          profile_completed: false,
          total_member_count: 10,
          rank: 1,
          is_test_user: false
        }}
      />
    );
    const nicknameInput = screen.getByRole("textbox", { name: "닉네임" });
    fireEvent.change(nicknameInput, { target: { value: "오상훈1234567" } });
    expect(nicknameInput).toHaveValue("오상훈1234567");
    const saveButton = screen.getByRole("button", { name: "저장하기" });
    fireEvent.click(saveButton);
    await waitFor(() => {
      expect(
        screen.getByText("닉네임 변경에 실패했습니다.")
      ).toBeInTheDocument();
    });
    //axios error의 메시지도 정상적으로 받아서 렌더링하는지 테스트
    expect(screen.getByText("닉네임 변경에 실패 테스트")).toBeInTheDocument();
  });
  it("프로필 설정 페이지에서 유효하지 않은 값을 입력했을 때 닉네임 실패 테스트", async () => {
    renderWithProviders(
      <LoginProfileSetting
        state="/"
        userInfo={{
          id: 1,
          nickname: "오상훈",
          score: 0,
          is_test_user: false,
          token_count: 10,
          profile_completed: false,
          total_member_count: 10,
          rank: 1
        }}
      />
    );
    const nicknameInput = screen.getByRole("textbox", { name: "닉네임" });
    fireEvent.change(nicknameInput, { target: { value: "ㅇㅗㅅㅏㅇㅎㅜㄴ" } });
    expect(nicknameInput).toHaveValue("ㅇㅗㅅㅏㅇㅎㅜㄴ");
    const saveButton = screen.getByRole("button", { name: "저장하기" });
    fireEvent.click(saveButton);
    await waitFor(() => {
      expect(
        screen.getByText(
          "닉네임은 한글 조합, 영문, 숫자, 띄어쓰기만 사용할 수 있습니다."
        )
      ).toBeInTheDocument();
    });

    //20자 이하 테스트
    fireEvent.change(nicknameInput, {
      target: {
        value: "오상훈1234567890123142214124214214214214"
      }
    });
    expect(nicknameInput).toHaveValue(
      "오상훈1234567890123142214124214214214214"
    );
    fireEvent.click(saveButton);
    await waitFor(() => {
      expect(
        screen.getByText("닉네임은 20자 이하이어야 합니다.")
      ).toBeInTheDocument();
    });

    //3자 이상 테스트
    fireEvent.change(nicknameInput, {
      target: {
        value: "오"
      }
    });
    expect(nicknameInput).toHaveValue("오");
    fireEvent.click(saveButton);
    await waitFor(() => {
      expect(
        screen.getByText("닉네임은 2자 이상이어야 합니다.")
      ).toBeInTheDocument();
    });
  });
});
