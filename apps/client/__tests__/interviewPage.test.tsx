/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/typedef */
import "@testing-library/jest-dom";
import { InterviewSideBar } from "@kokomen/ui/domains";
import { renderWithProviders } from "@/utils/test-utils";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import InterviewPage from "@/pages/interviews/[interviewId]";
import { server } from "@/mocks";
import { delay, http, HttpResponse } from "msw";
import { mockReplace } from "jest.setup";

// navigator.mediaDevices 모킹
Object.defineProperty(navigator, "mediaDevices", {
  value: {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: () => [{ stop: jest.fn() }]
    }),
    enumerateDevices: jest.fn().mockResolvedValue([
      {
        deviceId: "test-device-1",
        label: "Test Microphone",
        kind: "audioinput"
      }
    ]),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  },
  writable: true
});

// navigator.permissions 모킹
Object.defineProperty(navigator, "permissions", {
  value: {
    query: jest.fn().mockResolvedValue({
      state: "granted",
      onchange: null
    })
  },
  writable: true
});

// ResizeObserver 모킹
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// SpeechRecognition 모킹
const createMockSpeechRecognition = () => {
  const mockStart = jest.fn();
  const mockStop = jest.fn();
  const mockAbort = jest.fn();
  let currentInstance: any = null;

  class MockSpeechRecognition {
    lang = "ko-KR";
    continuous = true;
    interimResults = false;
    maxAlternatives = 1;

    onstart: (() => void) | null = null;
    onend: (() => void) | null = null;
    onresult: ((event: any) => void) | null = null;
    onerror: ((event: any) => void) | null = null;
    onnomatch: (() => void) | null = null;
    onsoundstart: (() => void) | null = null;
    onsoundend: (() => void) | null = null;

    constructor() {
      currentInstance = this;
    }

    start = mockStart.mockImplementation(() => {
      setTimeout(() => {
        if (this.onstart) this.onstart();
        // 자동으로 결과 시뮬레이션
        setTimeout(() => {
          if (this.onresult) {
            this.onresult({
              resultIndex: 0,
              results: [
                {
                  isFinal: true,
                  0: {
                    transcript: "테스트 음성 인식 결과",
                    confidence: 0.9
                  },
                  length: 1
                }
              ]
            });
          }
        }, 100);
      }, 0);
    });

    stop = mockStop.mockImplementation(() => {
      setTimeout(() => {
        if (this.onend) this.onend();
      }, 0);
    });

    abort = mockAbort;
  }

  return {
    MockSpeechRecognition,
    mockStart,
    mockStop,
    mockAbort,
    currentInstance
  };
};

// 테스트 데이터
const textInterviewData = {
  interview_id: 1,
  interview_state: "IN_PROGRESS" as const,
  prev_questions_and_answers: [
    {
      question_id: 1,
      question: "프로세스와 스레드 차이 설명해주세요.",
      answer_id: 1,
      answer: "프로세스는 무겁고 스레드는 경량입니다."
    }
  ],
  cur_question_id: 2,
  cur_question: "현재 새로운 질문",
  cur_question_count: 2,
  max_question_count: 3
};

const voiceInterviewData = {
  interview_id: 1,
  interview_state: "IN_PROGRESS" as const,
  prev_questions_and_answers: [
    {
      question_id: 1,
      question: "프로세스와 스레드 차이 설명해주세요.",
      answer_id: 1,
      answer: "프로세스는 무겁고 스레드는 경량입니다."
    }
  ],
  cur_question_id: 2,
  cur_question_voice_url: "https://example.com/voice.mp3",
  cur_question_count: 2,
  max_question_count: 3
};

const interviewAnswerData = {
  proceed_state: "COMPLETED" as const,
  interview_state: "IN_PROGRESS" as const,
  cur_answer_rank: "A",
  next_question_id: 3,
  next_question: "다음 질문입니다."
};

const finishedInterviewData = {
  proceed_state: "COMPLETED" as const,
  interview_state: "FINISHED" as const,
  cur_answer_rank: "A",
  next_question_id: 3,
  next_question: "면접이 종료되었습니다."
};

describe("면접 페이지 컴포넌트 렌더링 테스트", () => {
  it("면접 답변 사이드바 컴포넌트가 제대로 렌더링 되는지 테스트", () => {
    renderWithProviders(
      <InterviewSideBar
        prevQuestionAndAnswer={[]}
        open={false}
        openSidebar={() => {}}
        closeSidebar={() => {}}
      />
    );

    const openButton = screen.getByRole("button", { name: "사이드바 열기" });
    expect(openButton).toBeInTheDocument();
    expect(openButton).toBeVisible();
    expect(openButton).not.toBeDisabled();
  });

  it("면접 답변 사이드바 컴포넌트 Props로 받는 값이 제대로 들어가는지 확인", () => {
    renderWithProviders(
      <InterviewSideBar
        prevQuestionAndAnswer={[
          {
            answer: "테스트",
            question: "테스트입니다."
          }
        ]}
        open={false}
        openSidebar={() => {}}
        closeSidebar={() => {}}
      />
    );

    const question = screen.getByText("테스트입니다.");
    const answer = screen.getByText("테스트");
    expect(question).toBeInTheDocument();
    expect(answer).toBeInTheDocument();
    expect(question).toBeVisible();
    expect(answer).toBeVisible();
  });
});

describe("면접 페이지 테스트", () => {
  beforeEach(() => {
    window.ResizeObserver = ResizeObserver;
    // SpeechRecognition 모킹
    const { MockSpeechRecognition } = createMockSpeechRecognition();
    Object.defineProperty(window, "SpeechRecognition", {
      value: MockSpeechRecognition,
      writable: true
    });
    Object.defineProperty(window, "webkitSpeechRecognition", {
      value: MockSpeechRecognition,
      writable: true
    });
  });

  describe("면접 시작 모달 테스트", () => {
    it("면접 페이지 로드 시 시작 모달이 표시되는지 확인", async () => {
      server.use(
        http.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/interviews/1/check`,
          async ({ request }) => {
            const url = new URL(request.url);
            const mode = url.searchParams.get("mode");

            if (mode === "TEXT") {
              return HttpResponse.json(textInterviewData);
            }

            return HttpResponse.error();
          }
        )
      );

      renderWithProviders(<InterviewPage interviewId={1} mode="TEXT" />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "면접 시작하기" })
        ).toBeInTheDocument();
      });
    });
  });

  describe("텍스트 면접 모드 테스트", () => {
    it("텍스트 면접 시작 후 질문이 표시되는지 확인", async () => {
      server.use(
        http.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/interviews/1/check`,
          async ({ request }) => {
            const url = new URL(request.url);
            const mode = url.searchParams.get("mode");

            if (mode === "TEXT") {
              return HttpResponse.json(textInterviewData);
            }

            return HttpResponse.error();
          }
        )
      );

      renderWithProviders(<InterviewPage interviewId={1} mode="TEXT" />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "면접 시작하기" })
        ).toBeInTheDocument();
      });

      const startButton = screen.getByRole("button", { name: "면접 시작하기" });
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(screen.getByText("현재 새로운 질문")).toBeInTheDocument();
      });
    });

    it("텍스트 면접에서 답변 입력 후 제출이 정상적으로 작동하는지 확인", async () => {
      server.use(
        http.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/interviews/1/check`,
          async ({ request }) => {
            const url = new URL(request.url);
            const mode = url.searchParams.get("mode");

            if (mode === "TEXT") {
              return HttpResponse.json(textInterviewData);
            }

            return HttpResponse.error();
          }
        )
      );

      server.use(
        http.post(
          `${process.env.NEXT_PUBLIC_V2_API_BASE_URL}/interviews/1/questions/2/answers`,
          async () => {
            return HttpResponse.json({ status: "ok" });
          }
        )
      );

      server.use(
        http.get(
          `${process.env.NEXT_PUBLIC_V2_API_BASE_URL}/interviews/1/questions/2`,
          async () => {
            return HttpResponse.json(interviewAnswerData);
          }
        )
      );

      renderWithProviders(<InterviewPage interviewId={1} mode="TEXT" />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "면접 시작하기" })
        ).toBeInTheDocument();
      });

      const startButton = screen.getByRole("button", { name: "면접 시작하기" });
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(screen.getByText("현재 새로운 질문")).toBeInTheDocument();
      });

      const answerInput = screen.getByRole("textbox", {
        name: "interview-answer"
      });
      fireEvent.change(answerInput, { target: { value: "테스트 답변" } });

      const submitButton = screen.getByRole("button", {
        name: "interview-submit"
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("다음 질문입니다.")).toBeInTheDocument();
      });
    });
  });

  describe("음성 면접 모드 테스트", () => {
    it("음성 면접에서 음성 인식 버튼이 표시되지 않는지 확인", async () => {
      server.use(
        http.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/interviews/1/check`,
          async ({ request }) => {
            const url = new URL(request.url);
            const mode = url.searchParams.get("mode");

            if (mode === "VOICE") {
              return HttpResponse.json(voiceInterviewData);
            }

            return HttpResponse.error();
          }
        )
      );

      renderWithProviders(<InterviewPage interviewId={1} mode="VOICE" />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "면접 시작하기" })
        ).toBeInTheDocument();
      });

      const startButton = screen.getByRole("button", { name: "면접 시작하기" });
      fireEvent.click(startButton);

      expect(screen.queryByText("음성으로 말하기")).not.toBeInTheDocument();
    });
  });

  describe("면접 종료 테스트", () => {
    it("면접이 종료되면 종료 모달이 표시되는지 확인", async () => {
      server.use(
        http.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/interviews/1/check`,
          async ({ request }) => {
            const url = new URL(request.url);
            const mode = url.searchParams.get("mode");

            if (mode === "TEXT") {
              return HttpResponse.json({
                ...textInterviewData,
                interview_state: "FINISHED"
              });
            }

            return HttpResponse.error();
          }
        )
      );

      renderWithProviders(<InterviewPage interviewId={1} mode="TEXT" />);

      await waitFor(() => {
        expect(screen.getByText("면접이 종료되었습니다.")).toBeInTheDocument();
      });

      const homeButton = screen.getByRole("button", { name: "home-button" });
      const goToResultButton = screen.getByRole("button", {
        name: "go-to-result-button"
      });

      expect(homeButton).toBeInTheDocument();
      expect(goToResultButton).toBeInTheDocument();
      expect(homeButton).toBeEnabled();
      expect(goToResultButton).toBeEnabled();
    });

    it("홈으로 버튼을 누르면 홈 페이지로 이동하는지 확인", async () => {
      server.use(
        http.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/interviews/1/check`,
          async ({ request }) => {
            const url = new URL(request.url);
            const mode = url.searchParams.get("mode");

            if (mode === "TEXT") {
              return HttpResponse.json({
                ...textInterviewData,
                interview_state: "FINISHED"
              });
            }

            return HttpResponse.error();
          }
        )
      );

      renderWithProviders(<InterviewPage interviewId={1} mode="TEXT" />);

      await waitFor(() => {
        expect(screen.getByText("면접이 종료되었습니다.")).toBeInTheDocument();
      });

      const homeButton = screen.getByRole("button", { name: "home-button" });
      fireEvent.click(homeButton);

      expect(mockReplace).toHaveBeenCalledWith("/");
    });

    it("면접 결과 확인하기 버튼을 누르면 결과 페이지로 이동하는지 확인", async () => {
      server.use(
        http.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/interviews/1/check`,
          async ({ request }) => {
            const url = new URL(request.url);
            const mode = url.searchParams.get("mode");

            if (mode === "TEXT") {
              return HttpResponse.json({
                ...textInterviewData,
                interview_state: "FINISHED"
              });
            }

            return HttpResponse.error();
          }
        )
      );

      renderWithProviders(<InterviewPage interviewId={1} mode="TEXT" />);

      await waitFor(() => {
        expect(screen.getByText("면접이 종료되었습니다.")).toBeInTheDocument();
      });

      const goToResultButton = screen.getByRole("button", {
        name: "go-to-result-button"
      });
      fireEvent.click(goToResultButton);

      expect(mockReplace).toHaveBeenCalledWith("/interviews/1/result");
    });
  });

  describe("에러 처리 테스트", () => {
    it("면접 데이터 로딩 실패 시 에러가 표시되는지 확인", async () => {
      server.use(
        http.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/interviews/1/check`,
          async ({ request }) => {
            const url = new URL(request.url);
            const mode = url.searchParams.get("mode");

            if (mode === "TEXT") {
              return HttpResponse.error();
            }

            return HttpResponse.error();
          }
        )
      );

      renderWithProviders(<InterviewPage interviewId={1} mode="TEXT" />);

      await waitFor(() => {
        expect(screen.getByText("면접을 불러올 수 없어요")).toBeInTheDocument();
      });
    });
  });

  describe("UI 상태 테스트", () => {
    it("면접 시작 전 음성 인식 버튼이 비활성화되는지 확인", async () => {
      server.use(
        http.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/interviews/1/check`,
          async ({ request }) => {
            const url = new URL(request.url);
            const mode = url.searchParams.get("mode");

            if (mode === "TEXT") {
              return HttpResponse.json(textInterviewData);
            }

            return HttpResponse.error();
          }
        )
      );

      renderWithProviders(<InterviewPage interviewId={1} mode="TEXT" />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "면접 시작하기" })
        ).toBeInTheDocument();
      });

      const voiceButton = screen.getByRole("button", {
        name: "interview-voice-start"
      });
      expect(voiceButton).toBeDisabled();
    });

    it("답변 입력 중 제출 버튼이 비활성화되는지 확인", async () => {
      server.use(
        http.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/interviews/1/check`,
          async ({ request }) => {
            const url = new URL(request.url);
            const mode = url.searchParams.get("mode");

            if (mode === "TEXT") {
              return HttpResponse.json(textInterviewData);
            }

            return HttpResponse.error();
          }
        )
      );

      server.use(
        http.post(
          `${process.env.NEXT_PUBLIC_V2_API_BASE_URL}/interviews/1/questions/2/answers`,
          async () => {
            await delay(1000);
            return HttpResponse.json({ status: "ok" });
          }
        )
      );

      server.use(
        http.get(
          `${process.env.NEXT_PUBLIC_V2_API_BASE_URL}/interviews/1/questions/2`,
          async () => {
            return HttpResponse.json(interviewAnswerData);
          }
        )
      );

      renderWithProviders(<InterviewPage interviewId={1} mode="TEXT" />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "면접 시작하기" })
        ).toBeInTheDocument();
      });

      const startButton = screen.getByRole("button", { name: "면접 시작하기" });
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(screen.getByText("현재 새로운 질문")).toBeInTheDocument();
      });

      const answerInput = screen.getByRole("textbox", {
        name: "interview-answer"
      });
      fireEvent.change(answerInput, { target: { value: "테스트 답변" } });

      const submitButton = screen.getByRole("button", {
        name: "interview-submit"
      });
      fireEvent.click(submitButton);

      // 제출 중에는 버튼이 비활성화되어야 함
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });

    it("질문 진행 상황이 올바르게 표시되는지 확인", async () => {
      server.use(
        http.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/interviews/1/check`,
          async ({ request }) => {
            const url = new URL(request.url);
            const mode = url.searchParams.get("mode");

            if (mode === "TEXT") {
              return HttpResponse.json(textInterviewData);
            }

            return HttpResponse.error();
          }
        )
      );

      renderWithProviders(<InterviewPage interviewId={1} mode="TEXT" />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "면접 시작하기" })
        ).toBeInTheDocument();
      });

      const startButton = screen.getByRole("button", { name: "면접 시작하기" });
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(screen.getByText("1 / 3")).toBeInTheDocument();
      });
    });
  });
});
