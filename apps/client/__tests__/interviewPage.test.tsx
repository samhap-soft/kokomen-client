/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/typedef */
import "@testing-library/jest-dom";
import type { ComponentProps } from "react";
import { renderWithProviders } from "@/utils/test-utils";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import InterviewPage from "@/pages/interviews/[interviewId]";
import { server } from "@/mocks";
import { delay, http, HttpResponse } from "msw";
import { mockReplace } from "jest.setup";

/**
 * useAudio는 jsdom에 없는 오디오 재생에 의존한다. 실제 훅을 쓰면 mp3를 실제로
 * 요청해 msw의 unhandled request 경고가 잔뜩 찍히고 타이밍도 불안정해진다.
 * 오디오 재생은 테스트 대상이 아니므로 대체한다.
 * (재생 실패는 호출부에서 catch하므로 이 모킹 없이도 테스트는 통과한다)
 */
jest.mock("@kokomen/utils", () => {
  const actual = jest.requireActual("@kokomen/utils");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const react = require("react");
  return {
    ...actual,
    useAudio: () => ({
      playAudio: jest.fn().mockResolvedValue(undefined),
      stopAudio: jest.fn(),
      resetAudio: jest.fn(),
      audioRef: react.createRef(),
      playFinished: true,
      loadingRef: { current: false },
      readyRef: { current: true }
    })
  };
});

/**
 * 3D 면접관은 WebGL 이 필요해서 jsdom 에서 그릴 수 없다. 자리 표시용으로 바꾼다.
 */
jest.mock("@kokomen/ui/domains", () => {
  const actual = jest.requireActual("@kokomen/ui/domains");
  return {
    ...actual,
    AiInterviewInterface: () => null
  };
});

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

const mockCheck = (data: object | null) =>
  server.use(
    http.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/interviews/1/check`,
      () => (data ? HttpResponse.json(data) : HttpResponse.error())
    )
  );

const renderRoom = (
  props: Partial<ComponentProps<typeof InterviewPage>> = {}
) =>
  renderWithProviders(
    <InterviewPage
      interviewId={1}
      mode="TEXT"
      roomType="BASIC"
      categoryTitle="운영체제"
      {...props}
    />
  );

/** 입장 화면에서 "면접 입장하기"를 눌러 면접실로 들어간다 */
const joinRoom = async () => {
  fireEvent.click(await screen.findByRole("button", { name: "면접 입장하기" }));
};

describe("면접 페이지 테스트", () => {
  beforeEach(() => {
    window.localStorage.clear();
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

  describe("입장 화면", () => {
    it("입장 전에는 면접 제목과 입장 버튼만 보이고 질문은 보이지 않는다", async () => {
      mockCheck(textInterviewData);
      renderRoom();

      expect(
        await screen.findByText("면접을 시작할 준비가 되셨나요?")
      ).toBeInTheDocument();
      expect(screen.getByText("운영체제 모의면접")).toBeInTheDocument();
      expect(screen.queryByText("현재 새로운 질문")).not.toBeInTheDocument();
    });
  });

  describe("텍스트 면접", () => {
    it("입장하면 현재 질문과 진행도가 보인다", async () => {
      mockCheck(textInterviewData);
      renderRoom();
      await joinRoom();

      expect(screen.getByText("현재 새로운 질문")).toBeInTheDocument();
      expect(screen.getByText("질문 2 / 3")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "음성으로 말하기" })
      ).toBeInTheDocument();
    });

    it("면접 답변 기록을 열면 제출한 답변이 보이고 다시 작성 화면으로 돌아온다", async () => {
      mockCheck(textInterviewData);
      renderRoom();
      await joinRoom();

      fireEvent.click(screen.getByRole("button", { name: "면접 답변 기록" }));
      expect(screen.getByText("이번 면접 답변 기록")).toBeInTheDocument();
      expect(
        screen.getByText("프로세스와 스레드 차이 설명해주세요.")
      ).toBeInTheDocument();

      fireEvent.click(
        screen.getByRole("button", { name: "답변 작성으로 돌아가기" })
      );
      expect(screen.getByText("현재 새로운 질문")).toBeInTheDocument();
    });

    it("답변을 제출하는 동안 제출 버튼이 비활성화된다", async () => {
      mockCheck(textInterviewData);
      server.use(
        http.post(
          `${process.env.NEXT_PUBLIC_V2_API_BASE_URL}/interviews/1/questions/2/answers`,
          async () => {
            await delay(1000);
            return HttpResponse.json({ status: "ok" });
          }
        ),
        http.get(
          `${process.env.NEXT_PUBLIC_V2_API_BASE_URL}/interviews/1/questions/2`,
          () => HttpResponse.json(interviewAnswerData)
        )
      );
      renderRoom();
      await joinRoom();

      fireEvent.change(
        screen.getByRole("textbox", { name: "interview-answer" }),
        { target: { value: "테스트 답변" } }
      );
      const submitButton = screen.getByRole("button", {
        name: "interview-submit"
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });

    it("작성 중인 답변은 같은 질문으로 다시 들어오면 되살아난다", async () => {
      mockCheck(textInterviewData);
      const { unmount } = renderRoom();
      await joinRoom();

      fireEvent.change(
        screen.getByRole("textbox", { name: "interview-answer" }),
        { target: { value: "초안으로 남길 답변" } }
      );
      expect(
        await screen.findByText("초안 자동 저장됨", {}, { timeout: 2000 })
      ).toBeInTheDocument();
      unmount();

      renderRoom();
      await joinRoom();
      expect(
        screen.getByRole("textbox", { name: "interview-answer" })
      ).toHaveValue("초안으로 남길 답변");
    });
  });

  describe("음성 면접", () => {
    it("텍스트용 음성 입력 버튼 대신 녹음 버튼과 음성 제출 문구가 보인다", async () => {
      mockCheck(voiceInterviewData);
      renderRoom({ mode: "VOICE" });
      await joinRoom();

      expect(
        screen.queryByRole("button", { name: "음성으로 말하기" })
      ).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "녹음 시작" })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "interview-submit" })
      ).toHaveTextContent("답변 완료 및 제출");
    });
  });

  describe("면접 종료", () => {
    const finishedData = { ...textInterviewData, interview_state: "FINISHED" };

    it("끝난 면접은 입장 화면 없이 종료 dialog 를 보여준다", async () => {
      mockCheck(finishedData);
      renderRoom();

      expect(
        await screen.findByText("면접이 종료되었습니다.")
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "home-button" })).toBeEnabled();
      expect(
        screen.getByRole("button", { name: "go-to-result-button" })
      ).toBeEnabled();
    });

    it("홈으로 버튼을 누르면 홈으로 이동한다", async () => {
      mockCheck(finishedData);
      renderRoom();

      fireEvent.click(await screen.findByRole("button", { name: "home-button" }));
      expect(mockReplace).toHaveBeenCalledWith("/");
    });

    it("면접 결과 확인하기 버튼을 누르면 결과 페이지로 이동한다", async () => {
      mockCheck(finishedData);
      renderRoom();

      fireEvent.click(
        await screen.findByRole("button", { name: "go-to-result-button" })
      );
      expect(mockReplace).toHaveBeenCalledWith("/interviews/1/result");
    });
  });

  describe("에러 처리", () => {
    it("면접 데이터를 불러오지 못하면 에러 화면을 보여준다", async () => {
      mockCheck(null);
      renderRoom();

      expect(
        await screen.findByText("면접을 불러올 수 없어요")
      ).toBeInTheDocument();
    });
  });

  describe("면접 중도 종료", () => {
    it("조작 바의 면접 중도 종료를 누르면 확인 dialog 가 열린다", async () => {
      mockCheck(textInterviewData);
      renderRoom();
      await joinRoom();

      fireEvent.click(screen.getByRole("button", { name: "면접 중도 종료" }));
      expect(
        screen.getByRole("button", { name: "confirm-exit-button" })
      ).toBeInTheDocument();
    });
  });
});
