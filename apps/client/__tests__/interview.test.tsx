import "@testing-library/jest-dom";
import InterviewSideBar from "@/domains/interview/components/interviewSideBar";
import { renderWithProviders } from "@/utils/test-utils";
import { screen } from "@testing-library/react";

describe("면접 페이지 렌더링 테스트", () => {
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
            answer_id: 1,
            question: "테스트입니다.",
            question_id: 2,
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
