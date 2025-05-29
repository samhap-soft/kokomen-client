import { interviewApiInstance } from "@/domains/interview/api";
import { InterviewReport } from "@/domains/interviewReport/types";

// const dummyReport: InterviewReport = {
//   feedbacks: [
//     {
//       question_id: 1,
//       answer_id: 1,
//       question: "자바의 특징은 무엇인가요?",
//       answer: "자바는 객체지향 프로그래밍 언어입니다.",
//       answer_rank: "C",
//       answer_feedback: "부족합니다.",
//     },
//     {
//       question_id: 2,
//       answer_id: 2,
//       question: "객체지향의 특징을 설명해주세요.",
//       answer: "객체가 각자 책임집니다.",
//       answer_rank: "C",
//       answer_feedback: "부족합니다.",
//     },
//     {
//       question_id: 3,
//       answer_id: 3,
//       question: "객체는 무엇인가요?",
//       answer: "클래스의 인스턴스 입니다.",
//       answer_rank: "C",
//       answer_feedback: "부족합니다.",
//     },
//   ],
//   total_score: 10,
//   total_feedback:
//     "전반적으로 부족합니다. 객체지향에 대한 이해가 필요합니다.전반적으로 부족합니다. 객체지향에 대한 이해가 필요합니다.전반적으로 부족합니다. 객체지향에 대한 이해가 필요합니다.전반적으로 부족합니다. 객체지향에 대한 이해가 필요합니다.전반적으로 부족합니다. 객체지향에 대한 이해가 필요합니다.전반적으로 부족합니다. 객체지향에 대한 이해가 필요합니다.전반적으로 부족합니다. 객체지향에 대한 이해가 필요합니다.전반적으로 부족합니다. 객체지향에 대한 이해가 필요합니다.전반적으로 부족합니다. 객체지향에 대한 이해가 필요합니다.전반적으로 부족합니다. 객체지향에 대한 이해가 필요합니다.전반적으로 부족합니다. 객체지향에 대한 이해가 필요합니다.전반적으로 부족합니다. 객체지향에 대한 이해가 필요합니다.전반적으로 부족합니다. 객체지향에 대한 이해가 필요합니다.전반적으로 부족합니다. 객체지향에 대한 이해가 필요합니다.전반적으로 부족합니다. 객체지향에 대한 이해가 필요합니다.전반적으로 부족합니다. 객체지향에 대한 이해가 필요합니다.전반적으로 부족합니다. 객체지향에 대한 이해가 필요합니다.전반적으로 부족합니다. 객체지향에 대한 이해가 필요합니다.전반적으로 부족합니다. 객체지향에 대한 이해가 필요합니다.전반적으로 부족합니다. 객체지향에 대한 이해가 필요합니다.전반적으로 부족합니다. 객체지향에 대한 이해가 필요합니다.전반적으로 부족합니다. 객체지향에 대한 이해가 필요합니다.전반적으로 부족합니다. 객체지향에 대한 이해가 필요합니다.전반적으로 부족합니다. 객체지향에 대한 이해가 필요합니다.전반적으로 부족합니다. 객체지향에 대한 이해가 필요합니다.전반적으로 부족합니다. 객체지향에 대한 이해가 필요합니다.전반적으로 부족합니다. 객체지향에 대한 이해가 필요합니다.전반적으로 부족합니다. 객체지향에 대한 이해가 필요합니다.",
//   user_cur_score: 10,
//   user_prev_score: 0,
//   user_cur_rank: "BRONZE",
//   user_prev_rank: "BRONZE",
// };

function getInterviewReport(interview_id: string) {
  return interviewApiInstance.get<InterviewReport>(
    `/interviews/${interview_id}/result`
  );
}

export { getInterviewReport };
