import "@testing-library/jest-dom";
import InterviewSideBar from "@/domains/interview/components/interviewSideBar";
import { renderWithProviders } from "@/utils/test-utils";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import InterviewPage from "@/pages/interviews/[interviewId]";
import { server } from "@/mocks";
import { delay, http, HttpResponse } from "msw";

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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/interviews/1`,
        async () => {
          await delay(100);
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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/interviews/1`,
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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/interviews/1`,
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
});
