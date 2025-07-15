/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/typedef */
import "@testing-library/jest-dom";
import InterviewSideBar from "@/domains/interview/components/interviewSideBar";
import { renderWithProviders } from "@/utils/test-utils";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import InterviewPage from "@/pages/interviews/[interviewId]";
import { server } from "@/mocks";
import { delay, http, HttpResponse } from "msw";
import { mockReplace } from "jest.setup";

describe("면접 페이지 컴포넌트 렌더링 테스트", () => {
  it("면접 답변 사이드바 컴포넌트가 제대로 렌더링 되는지 테스트", () => {
    renderWithProviders(<InterviewSideBar />);

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
            question: "테스트입니다.",
          },
        ]}
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

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const interviewData = {
  interview_state: "IN_PROGRESS",
  prev_questions_and_answers: [
    {
      question_id: 1,
      question: "프로세스와 스레드 차이 설명해주세요.",
      answer_id: 1,
      answer: "프로세스는 무겁고 스레드는 경량입니다.",
    },
  ],
  cur_question_id: 2,
  cur_question: "현재 새로운 질문",
  cur_question_count: 2,
  max_question_count: 3,
};
const interviewAnswerData = {
  cur_answer_rank: "A",
  next_question_id: 3,
  next_question: "제출 완료",
};
describe("면접 페이지 테스트", () => {
  window.ResizeObserver = ResizeObserver;
  it("면접 페이지로 이동하면 제대로 데이터 페칭이 이루어지는지 확인", async () => {
    server.use(
      http.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/interviews/1/check`,
        async () => {
          return HttpResponse.json(interviewData);
        }
      )
    );
    renderWithProviders(<InterviewPage interviewId={1} />);

    await waitFor(() => {
      expect(
        screen.getByText(
          "꼬꼬면 면접에 오신걸 환영합니다. 준비가 되시면 버튼을 눌러 면접을 시작해주세요."
        )
      ).toBeInTheDocument();
    });

    const startButton = screen.getByRole("button", {
      name: "면접 시작하기",
    });

    expect(startButton).toBeEnabled();
  });
  it("면접 시작 버튼을 누르면 면접이 시작되고 질문이 변경되는지 테스트", async () => {
    server.use(
      http.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/interviews/1/check`,
        async () => {
          await delay(100);
          return HttpResponse.json(interviewData);
        }
      )
    );
    renderWithProviders(<InterviewPage interviewId={1} />);
    expect(
      screen.getByText(
        "꼬꼬면 면접에 오신걸 환영합니다. 준비가 되시면 버튼을 눌러 면접을 시작해주세요."
      )
    ).toBeInTheDocument();

    const startButton = screen.getByRole("button", {
      name: "면접 시작하기",
    });

    await waitFor(() => {
      expect(startButton).toBeEnabled();
    });
    fireEvent.click(startButton);
    await waitFor(() => {
      expect(screen.getByText("현재 새로운 질문")).toBeInTheDocument();
    });
  });
  it("면접 질문 답변 입력 후 제출 버튼을 누르면 제출 완료 메시지가 표시되는지 테스트", async () => {
    server.use(
      http.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/interviews/1/check`,
        async () => {
          await delay(100);
          return HttpResponse.json(interviewData);
        }
      )
    );
    server.use(
      http.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/interviews/1/questions/2/answers`,
        async () => {
          await delay(100);
          return HttpResponse.json(interviewAnswerData);
        }
      )
    );
    renderWithProviders(<InterviewPage interviewId={1} />);
    await waitFor(() => {
      expect(
        screen.getByText(
          "꼬꼬면 면접에 오신걸 환영합니다. 준비가 되시면 버튼을 눌러 면접을 시작해주세요."
        )
      ).toBeInTheDocument();
    });

    const startButton = screen.getByRole("button", {
      name: "면접 시작하기",
    });

    expect(startButton).toBeEnabled();
    fireEvent.click(startButton);
    await waitFor(() => {
      expect(screen.getByText("현재 새로운 질문")).toBeInTheDocument();
    });

    const answerInput = screen.getByRole("textbox", {
      name: "interview-answer",
    });
    fireEvent.change(answerInput, { target: { value: "테스트 답변" } });

    const submitButton = screen.getByRole("button", {
      name: "interview-submit",
    });

    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText("제출 완료")).toBeInTheDocument();
    });
  });

  it("면접 종료 버튼을 누르면 면접이 종료되고 면접 종료 모달이 표시되는지 테스트", async () => {
    server.use(
      http.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/interviews/1/check`,
        async () => {
          await delay(100);
          return HttpResponse.json({
            ...interviewData,
            interview_state: "FINISHED",
          });
        }
      )
    );
    renderWithProviders(<InterviewPage interviewId={1} />);

    await waitFor(() => {
      expect(screen.getByText("면접이 종료되었습니다.")).toBeInTheDocument();
    });
    const homeButton = screen.getByRole("button", {
      name: "home-button",
    });
    const goToResultButton = screen.getByRole("button", {
      name: "go-to-result-button",
    });
    expect(homeButton).toBeInTheDocument();
    expect(goToResultButton).toBeInTheDocument();
    expect(homeButton).toBeEnabled();
    expect(goToResultButton).toBeEnabled();
    fireEvent.click(homeButton);
    expect(mockReplace).toHaveBeenCalledWith("/");
  });

  it("음성 인식 버튼이 처음에 비활성화 되는지 테스트", async () => {
    server.use(
      http.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/interviews/1/check`,
        async () => {
          await delay(100);
          return HttpResponse.json(interviewData);
        }
      )
    );
    renderWithProviders(<InterviewPage interviewId={1} />);
    expect(
      screen.getByText(
        "꼬꼬면 면접에 오신걸 환영합니다. 준비가 되시면 버튼을 눌러 면접을 시작해주세요."
      )
    ).toBeInTheDocument();

    const voiceButton = screen.getByRole("button", {
      name: "interview-voice-start",
    });
    expect(voiceButton).toBeDisabled();
  });

  it("음성 인식 버튼을 누르면 음성 인식이 시작되고 버튼이 활성화 되는지 테스트", async () => {
    // SpeechRecognition 모킹
    const mockStart = jest.fn();
    const mockStop = jest.fn();
    const mockAbort = jest.fn();

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

      start = mockStart.mockImplementation(() => {
        // onstart 이벤트 트리거
        setTimeout(() => {
          if (this.onstart) this.onstart();
        }, 0);
      });

      stop = mockStop.mockImplementation(() => {
        // onend 이벤트 트리거
        setTimeout(() => {
          if (this.onend) this.onend();
        }, 0);
      });

      abort = mockAbort;
    }

    Object.defineProperty(window, "SpeechRecognition", {
      value: MockSpeechRecognition,
      writable: true,
    });

    Object.defineProperty(window, "webkitSpeechRecognition", {
      value: MockSpeechRecognition,
      writable: true,
    });

    server.use(
      http.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/interviews/1/check`,
        async () => {
          await delay(100);
          return HttpResponse.json(interviewData);
        }
      )
    );

    renderWithProviders(<InterviewPage interviewId={1} />);

    expect(
      screen.getByText(
        "꼬꼬면 면접에 오신걸 환영합니다. 준비가 되시면 버튼을 눌러 면접을 시작해주세요."
      )
    ).toBeInTheDocument();

    const startButton = screen.getByRole("button", {
      name: "면접 시작하기",
    });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText("현재 새로운 질문")).toBeInTheDocument();
    });

    const voiceButton = screen.getByRole("button", {
      name: "interview-voice-start",
    });

    fireEvent.click(voiceButton);

    // start 메서드가 호출되었는지 확인
    expect(mockStart).toHaveBeenCalled();

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "interview-voice-stop",
        })
      ).toBeInTheDocument();
    });
  });

  // 음성 인식 결과 시뮬레이션
  it("음성 인식 결과가 텍스트 입력에 반영되는지 테스트", async () => {
    const mockStart = jest.fn();
    const mockStop = jest.fn();

    class MockSpeechRecognition {
      lang = "ko-KR";
      continuous = true;
      interimResults = false;
      maxAlternatives = 1;

      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onresult: ((event: any) => void) | null = null;
      onerror: ((event: any) => void) | null = null;

      start = mockStart.mockImplementation(() => {
        setTimeout(() => {
          if (this.onstart) this.onstart();

          // 음성 인식 결과 시뮬레이션
          setTimeout(() => {
            if (this.onresult) {
              this.onresult({
                resultIndex: 0,
                results: [
                  [
                    {
                      transcript: "테스트 음성 인식 결과",
                      confidence: 0.9,
                    },
                  ],
                ],
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

      abort = jest.fn();
    }

    Object.defineProperty(window, "SpeechRecognition", {
      value: MockSpeechRecognition,
      writable: true,
    });

    Object.defineProperty(window, "webkitSpeechRecognition", {
      value: MockSpeechRecognition,
      writable: true,
    });

    server.use(
      http.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/interviews/1/check`,
        async () => {
          await delay(100);
          return HttpResponse.json(interviewData);
        }
      )
    );

    renderWithProviders(<InterviewPage interviewId={1} />);

    const startButton = screen.getByRole("button", {
      name: "면접 시작하기",
    });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText("현재 새로운 질문")).toBeInTheDocument();
    });

    const voiceButton = screen.getByRole("button", {
      name: "interview-voice-start",
    });
    fireEvent.click(voiceButton);

    await waitFor(() => {
      expect(mockStart).toHaveBeenCalled();
    });

    // 음성 인식 결과가 텍스트 입력에 반영되는지 확인
    await waitFor(() => {
      const textarea = screen.getByRole("textbox", {
        name: "interview-answer",
      });
      expect(textarea).toHaveValue(" 테스트 음성 인식 결과");
    });
  });
});
