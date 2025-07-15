import { InterviewReport } from "@/domains/interviewReport/types";
import { server } from "@/mocks";
import MyInterviewResultPage from "@/pages/interviews/[interviewId]/result";
import { renderWithProviders } from "@/utils/test-utils";
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import { http, HttpResponse } from "msw";

const myInterviewResultData: InterviewReport = {
  feedbacks: [
    {
      question_id: 1,
      answer_id: 1,
      question: "자기소개를 해주세요.",
      answer:
        "안녕하세요. 저는 3년차 프론트엔드 개발자입니다. React와 TypeScript를 주로 사용하며, 사용자 경험을 중시하는 개발자입니다.",
      answer_rank: "A",
      answer_feedback:
        "명확하고 간결한 자기소개로 좋은 첫인상을 주었습니다. 기술 스택과 개발 철학을 잘 어필했습니다.",
      submitted_answer_memo_content: "작성된 메모",
      temp_answer_memo_content: "임시작성 메모",
      answer_memo_visibility: "PUBLIC",
    },
  ],
  total_feedback:
    "전반적으로 기술적 역량과 협업 능력이 균형있게 발달한 개발자로 보입니다. 구체적인 경험과 성과를 바탕으로 답변하여 신뢰도가 높습니다. 향후 더 큰 규모의 프로젝트에서 리더십을 발휘할 수 있을 것으로 기대됩니다.",
  total_score: 85,
  user_cur_score: 85,
  user_prev_score: 80,
  user_cur_rank: "A",
  user_prev_rank: "B",
};

describe("내 면접결과 페이지 테스트", () => {
  it("내 면접결과 페이지 렌더링 테스트", async () => {
    renderWithProviders(
      <MyInterviewResultPage report={myInterviewResultData} userInfo={null} />
    );
    await waitFor(() => {
      expect(screen.getByText("자기소개를 해주세요.")).toBeInTheDocument();
    });
  });
});

describe("내 면접결과 메모 테스트", () => {
  it("메모가 제대로 렌더링 되는지 테스트", async () => {
    renderWithProviders(
      <MyInterviewResultPage report={myInterviewResultData} userInfo={null} />
    );
    await waitFor(() => {
      expect(screen.getByText("자기소개를 해주세요.")).toBeInTheDocument();
    });
    const answerFeedbackButton = screen.getByText("자기소개를 해주세요.");
    fireEvent.click(answerFeedbackButton);
    await waitFor(() => {
      expect(screen.getByText("작성된 메모")).toBeInTheDocument();
    });
  });

  it("임시 작성한 메모가 있을 때 모달이 렌더링 되는지 테스트", async () => {
    renderWithProviders(
      <MyInterviewResultPage report={myInterviewResultData} userInfo={null} />
    );
    await waitFor(() => {
      expect(screen.getByText("자기소개를 해주세요.")).toBeInTheDocument();
    });
    const answerFeedbackButton = screen.getByText("자기소개를 해주세요.");
    fireEvent.click(answerFeedbackButton);
    const memoEditButton = screen.getByRole("button", {
      name: "메모 편집하기",
    });
    fireEvent.click(memoEditButton);
    await waitFor(() => {
      expect(
        screen.getByText("임시 작성중인 메모가 있습니다. 메모를 불러올까요?")
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", {
          name: "새로쓰기",
        })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", {
          name: "이어서 작성",
        })
      ).toBeInTheDocument();
    });
  });
  it("임시 작성한 메모가 있을 때 새로쓰기 버튼을 눌렀을 때 모달이 닫히고 메모가 임시저장한 값으로 변경 되는지 테스트", async () => {
    renderWithProviders(
      <MyInterviewResultPage report={myInterviewResultData} userInfo={null} />
    );
    await waitFor(() => {
      expect(screen.getByText("자기소개를 해주세요.")).toBeInTheDocument();
    });
    const answerFeedbackButton = screen.getByText("자기소개를 해주세요.");
    fireEvent.click(answerFeedbackButton);
    const memoEditButton = screen.getByRole("button", {
      name: "메모 편집하기",
    });
    fireEvent.click(memoEditButton);
    await waitFor(() => {
      expect(
        screen.getByText("임시 작성중인 메모가 있습니다. 메모를 불러올까요?")
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", {
          name: "이어서 작성",
        })
      ).toBeInTheDocument();
    });

    const continueMemoButton = screen.getByRole("button", {
      name: "이어서 작성",
    });
    fireEvent.click(continueMemoButton);
    await waitFor(() => {
      expect(screen.getByText("임시작성 메모")).toBeInTheDocument();
    });
  });
  it("메모 삭제 버튼을 눌렀을 때 모달이 렌더링 되는지 테스트", async () => {
    renderWithProviders(
      <MyInterviewResultPage report={myInterviewResultData} userInfo={null} />
    );
    await waitFor(() => {
      expect(screen.getByText("자기소개를 해주세요.")).toBeInTheDocument();
    });
    const answerFeedbackButton = screen.getByText("자기소개를 해주세요.");
    fireEvent.click(answerFeedbackButton);
    const memoEditButton = screen.getByRole("button", {
      name: "메모 삭제하기",
    });
    fireEvent.click(memoEditButton);
  });

  it("메모 삭제 버튼을 눌렀을 때 정상적으로 API 요청과 응답이 오는지 확인", async () => {
    const deleteCalled = jest.fn();
    server.use(
      http.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/answers/1/memo`,
        () => {
          deleteCalled();
          return HttpResponse.json({
            message: "메모 삭제 성공",
          });
        }
      )
    );
    renderWithProviders(
      <MyInterviewResultPage report={myInterviewResultData} userInfo={null} />
    );
    await waitFor(() => {
      expect(screen.getByText("자기소개를 해주세요.")).toBeInTheDocument();
    });
    const answerFeedbackButton = screen.getByText("자기소개를 해주세요.");
    fireEvent.click(answerFeedbackButton);
    const memoEditButton = screen.getByRole("button", {
      name: "메모 삭제하기",
    });
    fireEvent.click(memoEditButton);
    const deleteButton = screen.getByRole("button", {
      name: "삭제하기",
    });
    fireEvent.click(deleteButton);
    await waitFor(() => {
      expect(deleteCalled).toHaveBeenCalled();
      expect(screen.queryByText("작성된 메모")).not.toBeInTheDocument();
    });
  });

  it("임시 저장중인 메모를 작성하고 저장 버튼을 눌렀을 때 정상적으로 API 요청과 응답이 오는지 확인", async () => {
    const saveCalled = jest.fn();
    server.use(
      http.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/answers/1/memo`,
        async () => {
          saveCalled();
          return HttpResponse.json({
            message: "메모 저장 성공",
          });
        }
      )
    );

    renderWithProviders(
      <MyInterviewResultPage report={myInterviewResultData} userInfo={null} />
    );

    await waitFor(() => {
      expect(screen.getByText("자기소개를 해주세요.")).toBeInTheDocument();
    });

    const answerFeedbackButton = screen.getByText("자기소개를 해주세요.");
    fireEvent.click(answerFeedbackButton);

    const memoEditButton = screen.getByRole("button", {
      name: "메모 편집하기",
    });
    fireEvent.click(memoEditButton);

    await waitFor(() => {
      expect(
        screen.getByText("임시 작성중인 메모가 있습니다. 메모를 불러올까요?")
      ).toBeInTheDocument();
    });

    const continueMemoButton = screen.getByRole("button", {
      name: "이어서 작성",
    });
    fireEvent.click(continueMemoButton);

    await waitFor(() => {
      expect(screen.getByText("임시작성 메모")).toBeInTheDocument();
    });

    const saveMemoButton = screen.getByRole("button", {
      name: "저장",
    });
    fireEvent.click(saveMemoButton);

    await waitFor(() => {
      expect(screen.getByText("임시작성 메모")).toBeInTheDocument();
    });
    expect(saveCalled).toHaveBeenCalled();
  });
});
