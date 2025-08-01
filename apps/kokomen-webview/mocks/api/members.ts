import { MemberInterview } from "@kokomen/types";
import { server } from "mocks";
import { http, HttpResponse } from "msw";

const mockMemberInterviewData: MemberInterview = {
  interview_summaries: [
    {
      interview_id: 1,
      interview_category: "테스트1",
      created_at: "2021-01-01",
      root_question: "면접 질문 검증용",
      max_question_count: 10,
      score: 20,
      interview_like_count: 111,
      interview_already_liked: false,
      interview_view_count: 10
    },
    {
      interview_id: 2,
      interview_category: "테스트2",
      created_at: "2021-01-01",
      root_question: "면접 질문",
      max_question_count: 10,
      score: 50,
      interview_like_count: 10,
      interview_already_liked: false,
      interview_view_count: 10
    }
  ],
  interviewee_nickname: "test",
  total_member_count: 100,
  interviewee_rank: 5,
  total_page_count: 1
};

const mockEmptyMemberInterviewData: MemberInterview = {
  ...mockMemberInterviewData,
  interview_summaries: []
};

const memberInterviews = () =>
  server.use(
    http.get(
      `${import.meta.env.VITE_API_BASE_URL}/interviews`,
      ({ request }) => {
        const url = new URL(request.url);
        const memberId = url.searchParams.get("member_id");

        // memberId가 "1"인 경우 기본 데이터 반환
        if (memberId === "1") {
          return HttpResponse.json(mockMemberInterviewData);
        }

        // memberId가 "2"인 경우 빈 데이터 반환
        if (memberId === "2") {
          return HttpResponse.json(mockEmptyMemberInterviewData);
        }

        return HttpResponse.json(mockMemberInterviewData);
      }
    )
  );

export { memberInterviews, mockMemberInterviewData };
