import { Interview, InterviewMode } from "@kokomen/types";
import axios, { AxiosInstance } from "axios";

export const interviewApiInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: true
});

interface NewInterviewResponse {
  interview_id: number;
  question_id: number;
  root_question: string;
}

interface NewInterviewRequest {
  category: string;
  max_question_count: number;
  mode: InterviewMode;
}

export const startNewInterview = async (
  data: NewInterviewRequest
): Promise<NewInterviewResponse> => {
  const { data: responseData } = await interviewApiInstance.post(
    "/interviews",
    data,
    {
      withCredentials: true
    }
  );
  return responseData;
};

export const getInterview = async (
  interviewId: string,
  mode: InterviewMode
): Promise<Interview> => {
  const { data } = await interviewApiInstance.get(
    `/interviews/${interviewId}/check?mode=${mode}`,
    {
      withCredentials: true
    }
  );
  return data;
};

export type { NewInterviewResponse, NewInterviewRequest };
