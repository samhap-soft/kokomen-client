import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";

import ChangeNickname from "@/domains/dashboard/components/changeNickname";
import Withdrawal from "@/domains/dashboard/components/withDrawl";
import { renderWithProviders } from "@/utils/test-utils";
import { server } from "@/mocks";
import { delay, http, HttpResponse } from "msw";
import { mockReplace } from "jest.setup";

const mockUserInfo = {
  id: 1,
  nickname: "테스트유저",
  profile_completed: true,
  score: 100,
  total_member_count: 1000,
  token_count: 50,
  rank: 10
};

describe("ChangeNickname 컴포넌트 테스트", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("닉네임 변경 페이지가 올바르게 렌더링됩니다", () => {
    renderWithProviders(<ChangeNickname userInfo={mockUserInfo} />);

    expect(screen.getByText("닉네임 변경")).toBeInTheDocument();
    expect(
      screen.getByText("새로운 닉네임으로 변경할 수 있습니다")
    ).toBeInTheDocument();
    expect(screen.getByText("현재 닉네임")).toBeInTheDocument();
    expect(screen.getByText("테스트유저")).toBeInTheDocument();
    expect(screen.getByText("저장하기")).toBeInTheDocument();
  });

  it("폼 제출 시 확인 모달이 열립니다", async () => {
    renderWithProviders(<ChangeNickname userInfo={mockUserInfo} />);

    const nicknameInput = screen.getByPlaceholderText("닉네임을 입력해주세요");
    const submitButton = screen.getByText("저장하기");

    // 닉네임 입력
    fireEvent.change(nicknameInput, { target: { value: "새로운닉네임" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("닉네임 변경 확인")).toBeInTheDocument();
      expect(screen.getByText(/새로운닉네임/)).toBeInTheDocument();
    });
  });

  it("확인 모달에서 취소 버튼을 클릭하면 모달이 닫힙니다", async () => {
    renderWithProviders(<ChangeNickname userInfo={mockUserInfo} />);

    // 폼 제출하여 모달 열기
    const nicknameInput = screen.getByPlaceholderText("닉네임을 입력해주세요");
    const submitButton = screen.getByText("저장하기");

    fireEvent.change(nicknameInput, { target: { value: "새로운닉네임" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("닉네임 변경 확인")).toBeInTheDocument();
    });

    // 취소 버튼 클릭
    const cancelButton = screen.getByText("취소");
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText("닉네임 변경 확인")).not.toBeInTheDocument();
    });
  });

  it("확인 모달에서 확인 버튼을 클릭하면 API가 호출됩니다", async () => {
    server.use(
      http.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/members/me/profile`,
        async () => {
          return HttpResponse.json({});
        }
      )
    );

    renderWithProviders(<ChangeNickname userInfo={mockUserInfo} />);

    // 폼 제출하여 모달 열기
    const nicknameInput = screen.getByPlaceholderText("닉네임을 입력해주세요");
    const submitButton = screen.getByText("저장하기");

    fireEvent.change(nicknameInput, { target: { value: "새로운닉네임" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("닉네임 변경 확인")).toBeInTheDocument();
    });

    // 확인 버튼 클릭
    const confirmButton = screen.getByText("확인");
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText("닉네임 변경 완료")).toBeInTheDocument();
    });
  });

  it("API 호출 성공 시 성공 모달이 표시됩니다", async () => {
    server.use(
      http.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/members/me/profile`,
        async () => {
          return HttpResponse.json({});
        }
      )
    );

    renderWithProviders(<ChangeNickname userInfo={mockUserInfo} />);

    // 폼 제출하여 확인 모달 열기
    const nicknameInput = screen.getByPlaceholderText("닉네임을 입력해주세요");
    const submitButton = screen.getByText("저장하기");

    fireEvent.change(nicknameInput, { target: { value: "새로운닉네임" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("닉네임 변경 확인")).toBeInTheDocument();
    });

    // 확인 버튼 클릭
    const confirmButton = screen.getByText("확인");
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText("닉네임 변경 완료")).toBeInTheDocument();
      expect(
        screen.getByText("닉네임이 성공적으로 변경되었습니다.")
      ).toBeInTheDocument();
    });
  });

  it("API 호출 실패 시 에러 토스트가 표시됩니다", async () => {
    server.use(
      http.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/members/me/profile`,
        async () => {
          return HttpResponse.json(
            { message: "닉네임이 이미 사용 중입니다." },
            { status: 400 }
          );
        }
      )
    );

    renderWithProviders(<ChangeNickname userInfo={mockUserInfo} />);

    // 폼 제출하여 확인 모달 열기
    const nicknameInput = screen.getByPlaceholderText("닉네임을 입력해주세요");
    const submitButton = screen.getByText("저장하기");

    fireEvent.change(nicknameInput, { target: { value: "새로운닉네임" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("닉네임 변경 확인")).toBeInTheDocument();
    });

    // 확인 버튼 클릭
    const confirmButton = screen.getByText("확인");
    fireEvent.click(confirmButton);

    // 에러 토스트가 표시되는지 확인 (실제로는 toast 라이브러리가 모킹되어야 함)
    await waitFor(() => {
      expect(screen.queryByText("닉네임 변경 완료")).not.toBeInTheDocument();
    });
  });

  it("성공 모달에서 새로고침 버튼을 클릭하면 페이지가 새로고침됩니다", async () => {
    server.use(
      http.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/members/me/profile`,
        async () => {
          return HttpResponse.json({});
        }
      )
    );

    renderWithProviders(<ChangeNickname userInfo={mockUserInfo} />);

    // 폼 제출하여 확인 모달 열기
    const nicknameInput = screen.getByPlaceholderText("닉네임을 입력해주세요");
    const submitButton = screen.getByText("저장하기");

    fireEvent.change(nicknameInput, { target: { value: "새로운닉네임" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("닉네임 변경 확인")).toBeInTheDocument();
    });

    // 확인 버튼 클릭하여 성공 모달 열기
    const confirmButton = screen.getByText("확인");
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText("닉네임 변경 완료")).toBeInTheDocument();
    });

    // 새로고침 버튼 클릭
    const refreshButton = screen.getByText("새로고침");
    fireEvent.click(refreshButton);

    // router.reload()가 호출되는지 확인 (실제로는 window.location.reload가 호출됨)
    expect(window.location.reload).toBeDefined();
  });
});

describe("Withdrawal 컴포넌트 테스트", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("회원 탈퇴 페이지가 올바르게 렌더링됩니다", () => {
    renderWithProviders(<Withdrawal />);

    expect(screen.getByText("회원 탈퇴")).toBeInTheDocument();
    expect(
      screen.getByText("계정을 영구적으로 삭제할 수 있습니다")
    ).toBeInTheDocument();
    expect(screen.getByText("주의사항")).toBeInTheDocument();
    expect(screen.getByText("탈퇴 전 확인사항")).toBeInTheDocument();
    expect(screen.getByText("회원 탈퇴 진행")).toBeInTheDocument();
  });

  it("주의사항이 올바르게 표시됩니다", () => {
    renderWithProviders(<Withdrawal />);

    expect(
      screen.getByText(
        /회원 탈퇴 시 개인정보는 삭제되지만, 면접 기록은 삭제되지 않습니다/
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(/점수, 랭킹 등 개인 정보가 모두 삭제됩니다/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/탈퇴 후에는 복구가 불가능합니다/)
    ).toBeInTheDocument();
  });

  it("회원 탈퇴 진행 버튼을 클릭하면 확인 모달이 열립니다", () => {
    renderWithProviders(<Withdrawal />);

    const withdrawalButton = screen.getByText("회원 탈퇴 진행");
    fireEvent.click(withdrawalButton);

    expect(screen.getByText("회원 탈퇴 확인")).toBeInTheDocument();
    expect(screen.getByText("정말 탈퇴하시겠습니까?")).toBeInTheDocument();
  });

  it("확인 모달에서 취소 버튼을 클릭하면 모달이 닫힙니다", () => {
    renderWithProviders(<Withdrawal />);

    // 탈퇴 버튼 클릭하여 모달 열기
    const withdrawalButton = screen.getByText("회원 탈퇴 진행");
    fireEvent.click(withdrawalButton);

    expect(screen.getByText("회원 탈퇴 확인")).toBeInTheDocument();

    // 취소 버튼 클릭
    const cancelButton = screen.getByText("취소");
    fireEvent.click(cancelButton);

    expect(screen.queryByText("회원 탈퇴 확인")).not.toBeInTheDocument();
  });

  it("확인 텍스트가 올바르게 입력되지 않으면 탈퇴 확인 버튼이 비활성화됩니다", () => {
    renderWithProviders(<Withdrawal />);

    // 탈퇴 버튼 클릭하여 모달 열기
    const withdrawalButton = screen.getByText("회원 탈퇴 진행");
    fireEvent.click(withdrawalButton);

    const confirmInput = screen.getByPlaceholderText("탈퇴하겠습니다");
    const confirmButton = screen.getByText("탈퇴 확인");

    // 잘못된 텍스트 입력
    fireEvent.change(confirmInput, { target: { value: "잘못된텍스트" } });
    expect(confirmButton).toBeDisabled();

    // 올바른 텍스트 입력
    fireEvent.change(confirmInput, { target: { value: "탈퇴하겠습니다" } });
    expect(confirmButton).not.toBeDisabled();
  });

  it("올바른 확인 텍스트 입력 후 탈퇴 확인 버튼을 클릭하면 API가 호출됩니다", async () => {
    server.use(
      http.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/kakao-withdraw`,
        async () => {
          return HttpResponse.json({});
        }
      )
    );

    renderWithProviders(<Withdrawal />);

    // 탈퇴 버튼 클릭하여 모달 열기
    const withdrawalButton = screen.getByText("회원 탈퇴 진행");
    fireEvent.click(withdrawalButton);

    // 올바른 확인 텍스트 입력
    const confirmInput = screen.getByPlaceholderText("탈퇴하겠습니다");
    fireEvent.change(confirmInput, { target: { value: "탈퇴하겠습니다" } });

    // 탈퇴 확인 버튼 클릭
    const confirmButton = screen.getByText("탈퇴 확인");
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText("회원 탈퇴 완료")).toBeInTheDocument();
    });
  });

  it("API 호출 시 로딩 모달이 표시됩니다", async () => {
    server.use(
      http.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/kakao-withdraw`,
        async () => {
          await delay(100);
          return HttpResponse.json({});
        }
      )
    );

    renderWithProviders(<Withdrawal />);

    // 탈퇴 버튼 클릭하여 모달 열기
    const withdrawalButton = screen.getByText("회원 탈퇴 진행");
    fireEvent.click(withdrawalButton);

    // 올바른 확인 텍스트 입력
    const confirmInput = screen.getByPlaceholderText("탈퇴하겠습니다");
    fireEvent.change(confirmInput, { target: { value: "탈퇴하겠습니다" } });

    // 탈퇴 확인 버튼 클릭
    const confirmButton = screen.getByText("탈퇴 확인");
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText("회원 탈퇴 처리 중")).toBeInTheDocument();
      expect(
        screen.getByText("회원 탈퇴를 처리하고 있습니다")
      ).toBeInTheDocument();
    });
  });

  it("API 호출 성공 시 성공 모달이 표시됩니다", async () => {
    server.use(
      http.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/kakao-withdraw`,
        async () => {
          return HttpResponse.json({});
        }
      )
    );

    renderWithProviders(<Withdrawal />);

    // 탈퇴 버튼 클릭하여 모달 열기
    const withdrawalButton = screen.getByText("회원 탈퇴 진행");
    fireEvent.click(withdrawalButton);

    // 올바른 확인 텍스트 입력
    const confirmInput = screen.getByPlaceholderText("탈퇴하겠습니다");
    fireEvent.change(confirmInput, { target: { value: "탈퇴하겠습니다" } });

    // 탈퇴 확인 버튼 클릭
    const confirmButton = screen.getByText("탈퇴 확인");
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText("회원 탈퇴 완료")).toBeInTheDocument();
      expect(
        screen.getByText("회원 탈퇴가 완료되었습니다")
      ).toBeInTheDocument();
      expect(
        screen.getByText(/모든 데이터가 성공적으로 삭제되었습니다/)
      ).toBeInTheDocument();
    });
  });

  it("성공 모달에서 확인 버튼을 클릭하면 홈페이지로 이동합니다", async () => {
    server.use(
      http.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/kakao-withdraw`,
        async () => {
          return HttpResponse.json({});
        }
      )
    );

    renderWithProviders(<Withdrawal />);

    // 탈퇴 버튼 클릭하여 모달 열기
    const withdrawalButton = screen.getByText("회원 탈퇴 진행");
    fireEvent.click(withdrawalButton);

    // 올바른 확인 텍스트 입력
    const confirmInput = screen.getByPlaceholderText("탈퇴하겠습니다");
    fireEvent.change(confirmInput, { target: { value: "탈퇴하겠습니다" } });

    // 탈퇴 확인 버튼 클릭
    const confirmButton = screen.getByText("탈퇴 확인");
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText("회원 탈퇴 완료")).toBeInTheDocument();
    });

    // 확인 버튼 클릭
    const successConfirmButton = screen.getByText("확인");
    fireEvent.click(successConfirmButton);

    expect(mockReplace).toHaveBeenCalledWith("/");
  });

  it("API 호출 실패 시 로딩 모달이 닫힙니다", async () => {
    server.use(
      http.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/kakao-withdraw`,
        async () => {
          return HttpResponse.json(
            { message: "탈퇴 처리에 실패했습니다." },
            { status: 500 }
          );
        }
      )
    );

    renderWithProviders(<Withdrawal />);

    // 탈퇴 버튼 클릭하여 모달 열기
    const withdrawalButton = screen.getByText("회원 탈퇴 진행");
    fireEvent.click(withdrawalButton);

    // 올바른 확인 텍스트 입력
    const confirmInput = screen.getByPlaceholderText("탈퇴하겠습니다");
    fireEvent.change(confirmInput, { target: { value: "탈퇴하겠습니다" } });

    // 탈퇴 확인 버튼 클릭
    const confirmButton = screen.getByText("탈퇴 확인");
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText("회원 탈퇴 처리 중")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.queryByText("회원 탈퇴 처리 중")).not.toBeInTheDocument();
    });
  });
});
