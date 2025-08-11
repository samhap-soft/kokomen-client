import { describe, test, expect, beforeEach, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { server } from "mocks";
import { http, HttpResponse } from "msw";
import { Interview } from "@kokomen/types";
import { openPageSetup } from "@/utils/test-utils";

// 테스트용 인터뷰 데이터
const mockInterviewData: Interview = {
  interview_id: 1,
  interview_state: "IN_PROGRESS",
  prev_questions_and_answers: [],
  cur_question_id: 1,
  cur_question: "자기소개를 해주세요.",
  max_question_count: 5,
  cur_question_count: 0
};

const mockInterviewAnswerResponse = {
  cur_answer_rank: "A" as const,
  next_question_id: 2,
  next_question: "다음 질문입니다."
};

const mockUserData = {
  id: 1,
  nickname: "오상훈",
  score: 100,
  total_member_count: 100,
  rank: 1,
  token_count: 100,
  profile_completed: true
};

const mockUserAPI = () => {
  server.use(
    http.get(`${import.meta.env.VITE_API_BASE_URL}/members/me/profile`, () => {
      return HttpResponse.json(mockUserData);
    })
  );
};

// API 모킹 헬퍼 함수
const mockInterviewAPI = () => {
  server.use(
    http.get(`${import.meta.env.VITE_API_BASE_URL}/interviews/1/check`, () => {
      return HttpResponse.json(mockInterviewData);
    })
  );
};

const mockInterviewAnswerAPI = (response = mockInterviewAnswerResponse) => {
  server.use(
    http.post(
      `${import.meta.env.VITE_WEB_BASE_URL}/api/interviews/answers?interviewId=1&questionId=1`,
      async ({ request }) => {
        const body = (await request.json()) as { answer: string };
        expect(body.answer).toBeTruthy();
        return HttpResponse.json(response);
      }
    )
  );
};

const mockInterviewFinishAPI = () => {
  server.use(
    http.post(
      `${import.meta.env.VITE_WEB_BASE_URL}/api/interviews/answers?interviewId=1&questionId=1`,
      () => {
        return new HttpResponse(null, { status: 204 });
      }
    )
  );
};

const waitForPageLoad = async () => {
  await openPageSetup("/interviews/1");
  await waitFor(() => {
    expect(
      screen.getByRole("button", { name: "면접 시작하기" })
    ).toBeInTheDocument();
  });
};

describe("인터뷰 페이지 테스트", () => {
  beforeEach(() => {
    mockUserAPI();
    mockInterviewAPI();
    mockInterviewAnswerAPI();
  });

  test("면접 시작 버튼 클릭 시 인터뷰가 시작되는지 확인", async () => {
    await waitForPageLoad();
    const startButton = screen.getByRole("button", { name: "면접 시작하기" });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText("자기소개를 해주세요.")).toBeInTheDocument();
    });

    expect(
      screen.queryByRole("button", { name: "면접 시작하기" })
    ).not.toBeInTheDocument();
  });

  test("답변 입력 및 제출 기능 테스트", async () => {
    await waitForPageLoad();

    // 면접 시작
    fireEvent.click(screen.getByRole("button", { name: "면접 시작하기" }));

    await waitFor(() => {
      expect(screen.getByText("자기소개를 해주세요.")).toBeInTheDocument();
    });

    // 답변 입력
    const answerInput = screen.getByRole("textbox", {
      name: "interview-answer"
    });
    fireEvent.change(answerInput, {
      target: { value: "안녕하세요. 저는 개발자입니다." }
    });

    // 제출 버튼 클릭
    const submitButton = screen.getByRole("button", {
      name: "interview-submit"
    });
    fireEvent.click(submitButton);

    // 다음 질문이 표시되는지 확인
    await waitFor(() => {
      expect(screen.getByText("다음 질문입니다.")).toBeInTheDocument();
    });

    // 입력창이 초기화되는지 확인
    expect(answerInput).toHaveValue("");
  });

  test("Enter 키로 답변 제출 기능 테스트", async () => {
    await waitForPageLoad();

    // 면접 시작
    fireEvent.click(screen.getByRole("button", { name: "면접 시작하기" }));

    await waitFor(() => {
      expect(screen.getByText("자기소개를 해주세요.")).toBeInTheDocument();
    });

    // 답변 입력
    const answerInput = screen.getByRole("textbox", {
      name: "interview-answer"
    });
    fireEvent.change(answerInput, {
      target: { value: "Enter 키로 제출하는 답변입니다." }
    });

    // Enter 키로 제출
    fireEvent.keyDown(answerInput, { key: "Enter", code: "Enter" });

    // 다음 질문이 표시되는지 확인
    await waitFor(() => {
      expect(screen.getByText("다음 질문입니다.")).toBeInTheDocument();
    });
  });

  test("Shift+Enter로 줄바꿈 기능 테스트", async () => {
    await waitForPageLoad();

    // 면접 시작
    fireEvent.click(screen.getByRole("button", { name: "면접 시작하기" }));

    await waitFor(() => {
      expect(screen.getByText("자기소개를 해주세요.")).toBeInTheDocument();
    });

    // 답변 입력
    const answerInput = screen.getByRole("textbox", {
      name: "interview-answer"
    });
    fireEvent.change(answerInput, { target: { value: "첫 번째 줄" } });

    // Shift+Enter로 줄바꿈
    fireEvent.keyDown(answerInput, {
      key: "Enter",
      code: "Enter",
      shiftKey: true
    });
    fireEvent.change(answerInput, {
      target: { value: "첫 번째 줄\n두 번째 줄" }
    });

    // 제출되지 않고 줄바꿈이 유지되는지 확인
    expect(answerInput).toHaveValue("첫 번째 줄\n두 번째 줄");
  });

  test("빈 답변 제출 시 제출 버튼이 비활성화되는지 확인", async () => {
    await waitForPageLoad();

    // 면접 시작
    fireEvent.click(screen.getByRole("button", { name: "면접 시작하기" }));

    await waitFor(() => {
      expect(screen.getByText("자기소개를 해주세요.")).toBeInTheDocument();
    });

    // 빈 답변일 때 제출 버튼이 비활성화되는지 확인
    const submitButton = screen.getByRole("button", {
      name: "interview-submit"
    });
    expect(submitButton).toBeDisabled();

    // 답변 입력 후 활성화되는지 확인
    const answerInput = screen.getByRole("textbox", {
      name: "interview-answer"
    });
    fireEvent.change(answerInput, { target: { value: "답변" } });
    expect(submitButton).toBeEnabled();
  });

  test("음성 인식 기능 테스트", async () => {
    // React Native WebView 모킹
    Object.defineProperty(window, "ReactNativeWebView", {
      value: {
        postMessage: vi.fn()
      },
      writable: true
    });

    await waitForPageLoad();

    // 면접 시작
    fireEvent.click(screen.getByRole("button", { name: "면접 시작하기" }));

    await waitFor(() => {
      expect(screen.getByText("자기소개를 해주세요.")).toBeInTheDocument();
    });

    // 음성 인식 버튼 확인
    const voiceButton = screen.getByRole("button", {
      name: "interview-voice-start"
    });
    expect(voiceButton).toBeInTheDocument();

    // 음성 인식 시작
    fireEvent.click(voiceButton);

    // 음성 인식 중 상태 확인
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "interview-voice-stop" })
      ).toBeInTheDocument();
    });

    // 음성 인식 중지
    fireEvent.click(
      screen.getByRole("button", { name: "interview-voice-stop" })
    );
    expect(
      screen.getByRole("button", { name: "interview-voice-start" })
    ).toBeInTheDocument();
  });

  test("음성 인식 결과가 입력창에 반영되는지 확인", async () => {
    await waitForPageLoad();

    // 면접 시작
    fireEvent.click(screen.getByRole("button", { name: "면접 시작하기" }));

    await waitFor(() => {
      expect(screen.getByText("자기소개를 해주세요.")).toBeInTheDocument();
    });

    // 음성 인식 시작
    fireEvent.click(
      screen.getByRole("button", { name: "interview-voice-start" })
    );

    // 음성 인식 결과 시뮬레이션
    const messageEvent = new MessageEvent("message", {
      data: JSON.stringify({
        type: "speechRecognitionResult",
        result: "음성으로 입력한 답변입니다."
      })
    });

    window.dispatchEvent(messageEvent);

    // 입력창에 결과가 반영되는지 확인
    await waitFor(() => {
      const answerInput = screen.getByRole("textbox", {
        name: "interview-answer"
      });
      expect(answerInput).toHaveValue("음성으로 입력한 답변입니다.");
    });
  });

  test("면접 진행 상황 표시 테스트", async () => {
    await waitForPageLoad();

    // 면접 시작
    fireEvent.click(screen.getByRole("button", { name: "면접 시작하기" }));

    await waitFor(() => {
      expect(screen.getByText("자기소개를 해주세요.")).toBeInTheDocument();
    });

    // 진행 상황 표시 확인 (0 / 5)
    expect(screen.getByText("0 / 5")).toBeInTheDocument();

    // 답변 제출
    const answerInput = screen.getByRole("textbox", {
      name: "interview-answer"
    });
    fireEvent.change(answerInput, { target: { value: "답변" } });
    fireEvent.click(screen.getByRole("button", { name: "interview-submit" }));

    // 진행 상황 업데이트 확인 (1 / 5)
    await waitFor(() => {
      expect(screen.getByText("1 / 5")).toBeInTheDocument();
    });
  });

  test("면접 종료 시 모달 표시 테스트", async () => {
    mockInterviewFinishAPI();
    await waitForPageLoad();

    // 면접 시작
    fireEvent.click(screen.getByRole("button", { name: "면접 시작하기" }));

    await waitFor(() => {
      expect(screen.getByText("자기소개를 해주세요.")).toBeInTheDocument();
    });

    // 답변 제출
    const answerInput = screen.getByRole("textbox", {
      name: "interview-answer"
    });
    fireEvent.change(answerInput, { target: { value: "마지막 답변" } });
    fireEvent.click(screen.getByRole("button", { name: "interview-submit" }));

    // 면접 종료 메시지 확인
    await waitFor(() => {
      expect(
        screen.getByText("면접이 종료되었습니다. 수고하셨습니다.")
      ).toBeInTheDocument();
    });

    // 모달 버튼들 확인
    expect(
      screen.getByRole("button", { name: "home-button" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "go-to-result-button" })
    ).toBeInTheDocument();
  });

  test("면접 종료 모달에서 홈으로 이동 테스트", async () => {
    mockInterviewFinishAPI();

    await waitForPageLoad();

    // 면접 시작 및 종료
    fireEvent.click(screen.getByRole("button", { name: "면접 시작하기" }));
    fireEvent.change(
      screen.getByRole("textbox", { name: "interview-answer" }),
      { target: { value: "답변" } }
    );
    fireEvent.click(screen.getByRole("button", { name: "interview-submit" }));
    // 면접 종료 메시지 확인
    await waitFor(() => {
      expect(
        screen.getByText("면접이 종료되었습니다. 수고하셨습니다.")
      ).toBeInTheDocument();
    });

    // 홈으로 버튼 클릭
    fireEvent.click(screen.getByRole("button", { name: "home-button" }));

    // 홈 페이지로 이동하는지 확인
    await waitFor(() => {
      expect(window.location.pathname).toBe("/");
    });
  });

  test("면접 종료 모달에서 결과 페이지로 이동 테스트", async () => {
    mockInterviewFinishAPI();

    await waitForPageLoad();

    // 면접 시작 및 종료
    fireEvent.click(screen.getByRole("button", { name: "면접 시작하기" }));
    fireEvent.change(
      screen.getByRole("textbox", { name: "interview-answer" }),
      { target: { value: "답변" } }
    );
    fireEvent.click(screen.getByRole("button", { name: "interview-submit" }));
    // 면접 종료 메시지 확인
    await waitFor(() => {
      expect(
        screen.getByText("면접이 종료되었습니다. 수고하셨습니다.")
      ).toBeInTheDocument();
    });

    // 결과 확인하기 버튼 클릭
    fireEvent.click(
      screen.getByRole("button", { name: "go-to-result-button" })
    );

    // 결과 페이지로 이동하는지 확인
    await waitFor(() => {
      expect(window.location.pathname).toBe("/interviews/1/result");
    });
  });

  test("인터뷰 데이터 로딩 에러 처리 테스트", async () => {
    mockUserAPI();
    // 인터뷰 데이터 로딩 에러 모킹
    server.use(
      http.get(
        `${import.meta.env.VITE_API_BASE_URL}/interviews/1/check`,
        () => {
          return HttpResponse.json(
            { message: "인터뷰를 찾을 수 없습니다." },
            { status: 500 }
          );
        }
      )
    );

    await openPageSetup("/interviews/1");

    // 에러 컴포넌트가 표시되는지 확인
    await waitFor(
      () => {
        expect(
          screen.getByText("서버에 오류가 발생했어요.")
        ).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  test("텍스트 영역 자동 높이 조절 테스트", async () => {
    await waitForPageLoad();

    // 면접 시작
    fireEvent.click(screen.getByRole("button", { name: "면접 시작하기" }));

    await waitFor(() => {
      expect(screen.getByText("자기소개를 해주세요.")).toBeInTheDocument();
    });

    const answerInput = screen.getByRole("textbox", {
      name: "interview-answer"
    });

    // 긴 텍스트 입력
    const longText = "이것은 매우 긴 답변입니다.\n".repeat(10);
    fireEvent.change(answerInput, { target: { value: longText } });

    // 최대 높이 제한 확인 (400px)
    const height = answerInput.style.height;
    expect(parseInt(height)).toBeLessThanOrEqual(400);
  });

  test("면접 진행 중 사이드바 닫기 기능 테스트", async () => {
    await waitForPageLoad();

    // 면접 시작
    fireEvent.click(screen.getByRole("button", { name: "면접 시작하기" }));

    // 답변 제출하여 이전 질문-답변 생성
    fireEvent.change(
      screen.getByRole("textbox", { name: "interview-answer" }),
      { target: { value: "답변" } }
    );
    fireEvent.click(screen.getByRole("button", { name: "interview-submit" }));

    // 사이드바 열기
    fireEvent.click(screen.getByRole("button", { name: "사이드바 열기" }));
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();

    // 사이드바 닫기 버튼 클릭
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
  });
});
