import axios from "axios";

export const interviewApiInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

interface NewInterviewResponse {
  interview_id: number;
  question_id: number;
  root_question: string;
}

interface NewInterviewRequest {
  category: string;
  max_question_count: number;
}

export const startNewInterview = async (
  data: NewInterviewRequest
): Promise<NewInterviewResponse> => {
  const { data: responseData } = await interviewApiInstance.post(
    "/interviews",
    data
  );
  return responseData;
};

export type { NewInterviewResponse, NewInterviewRequest };
