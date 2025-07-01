import { interviewApiInstance } from "@/domains/interview/api";
import { AxiosResponse } from "axios";

interface InterviewAnswerApiRequest {
  answer: string;
}

interface InterviewAnswerApiResponse {
  cur_answer_rank: string;
  next_question_id: number;
  next_question: string;
}

export async function submitInterviewAnswer({
  interviewId,
  questionId,
  answer,
}: {
  interviewId: number;
  questionId: number;
  answer: string;
}): Promise<AxiosResponse<InterviewAnswerApiResponse, any>> {
  return interviewApiInstance.post<
    InterviewAnswerApiResponse,
    AxiosResponse<InterviewAnswerApiResponse>,
    InterviewAnswerApiRequest
  >(
    `/interviews/${interviewId}/questions/${questionId}/answers`,
    {
      answer: answer,
    },
    {
      timeout: 30000,
    }
  );
}
