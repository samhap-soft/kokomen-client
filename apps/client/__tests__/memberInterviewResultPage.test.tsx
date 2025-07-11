import { renderWithProviders } from "@/utils/test-utils";
import MemberInterviewResultPage from "@/pages/members/interviews/[interviewId]";
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import { server } from "@/mocks";
import { http, HttpResponse } from "msw";
import {
  CamelCasedProperties,
  mapToCamelCase,
} from "@/utils/convertConvention";
import { MemberInterviewResult } from "@/domains/members/types";

const memberInterviewResultData = {
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
      answer_like_count: 15,
      answer_already_liked: false,
    },
  ],
  total_feedback:
    "전반적으로 기술적 역량과 협업 능력이 균형있게 발달한 개발자로 보입니다. 구체적인 경험과 성과를 바탕으로 답변하여 신뢰도가 높습니다. 향후 더 큰 규모의 프로젝트에서 리더십을 발휘할 수 있을 것으로 기대됩니다.",
  total_score: 85,
  interview_like_count: 23,
  interview_already_liked: false,
};

describe("면접 결과 페이지 테스트", () => {
  it("면접 결과 페이지 렌더링 테스트", async () => {
    renderWithProviders(
      <MemberInterviewResultPage
        interviewId={1}
        result={
          mapToCamelCase(
            memberInterviewResultData
          ) as CamelCasedProperties<MemberInterviewResult>
        }
        user={null}
      />
    );
    await waitFor(() => {
      expect(screen.getByText("자기소개를 해주세요.")).toBeInTheDocument();
    });
  });
  it("면접 좋아요 버튼 클릭 테스트", async () => {
    renderWithProviders(
      <MemberInterviewResultPage
        interviewId={1}
        result={
          mapToCamelCase(
            memberInterviewResultData
          ) as CamelCasedProperties<MemberInterviewResult>
        }
        user={null}
      />
    );
    //좋아요 안 눌렀을 경우
    server.use(
      http.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/interviews/1/like`,
        () => {
          return HttpResponse.json({
            message: "좋아요 성공",
          });
        }
      )
    );

    await waitFor(() => {
      expect(screen.getByText("자기소개를 해주세요.")).toBeInTheDocument();
    });
    const interviewLikeButton = screen.getByRole("button", {
      name: "전체 인터뷰 좋아요",
    });
    fireEvent.click(interviewLikeButton);
    await waitFor(() => {
      expect(interviewLikeButton).toHaveClass("bg-volcano-3 text-volcano-6");
    });
    //좋아요 눌렀을 경우
    server.use(
      http.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/interviews/1/like`,
        async () => {
          return HttpResponse.json({
            message: "좋아요 취소 성공",
          });
        }
      )
    );
    fireEvent.click(interviewLikeButton);
    await waitFor(() => {
      expect(interviewLikeButton).not.toHaveClass(
        "bg-volcano-3 text-volcano-6"
      );
    });
  });
  it("질문 좋아요 버튼 클릭 테스트", async () => {
    renderWithProviders(
      <MemberInterviewResultPage
        interviewId={1}
        result={
          mapToCamelCase(
            memberInterviewResultData
          ) as CamelCasedProperties<MemberInterviewResult>
        }
        user={null}
      />
    );
    server.use(
      http.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/answers/1/like`,
        async () => {
          return HttpResponse.json({
            message: "좋아요 성공",
          });
        }
      )
    );
    await waitFor(() => {
      expect(screen.getByText("자기소개를 해주세요.")).toBeInTheDocument();
    });
    //좋아요 안 눌렀을 경우
    const answerLikeButton = screen.getByRole("button", {
      name: "답변 1 좋아요",
    });
    fireEvent.click(answerLikeButton);
    await waitFor(() => {
      expect(answerLikeButton).toHaveClass("bg-volcano-3 text-volcano-6");
    });

    //좋아요 눌렀을 경우
    server.use(
      http.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/answers/1/like`,
        () => {
          return HttpResponse.json({
            message: "좋아요 취소 성공",
          });
        }
      )
    );
    fireEvent.click(answerLikeButton);
    await waitFor(() => {
      expect(answerLikeButton).not.toHaveClass("bg-volcano-3 text-volcano-6");
    });
  });
});
