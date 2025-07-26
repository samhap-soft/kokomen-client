import { interviewApiInstance } from "@/domains/interviews/api";
import { AxiosPromise } from "axios";

interface InterviewAnswerResponse {
  cur_answer_rank: string;
  next_question_id: number;
  next_question: string;
}

export async function submitInterviewAnswer({
  interviewId,
  questionId,
  answer
}: {
  interviewId: number;
  questionId: number;
  answer: string;
}): AxiosPromise<InterviewAnswerResponse> {
  return interviewApiInstance.post(
    `/interviews/${interviewId}/questions/${questionId}/answers`,
    {
      answer: answer
    },
    {
      timeout: 30000
    }
  );
}
