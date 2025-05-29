import { interviewApiInstance } from "@/domains/interview/api";
import { AxiosResponse } from "axios";

interface InterviewAnswerApiRequest {
  answer: string;
}

interface IntercviewAnswerApiResponse {
  question_id: number;
  question: string;
  is_root: boolean;
}

export async function submitInterviewAnswer({
  interview_id,
  question_id,
  answer,
}: {
  interview_id: string;
  question_id: number;
  answer: string;
}) {
  return interviewApiInstance.post<
    IntercviewAnswerApiResponse,
    AxiosResponse<IntercviewAnswerApiResponse>,
    InterviewAnswerApiRequest
  >(
    `/interviews/${interview_id}/questions/${question_id}/answers`,
    {
      answer: answer,
    },
    {
      timeout: 10000,
    }
  );
}
