import { Interview, InterviewMode } from "@kokomen/types";
import axios, { AxiosInstance, isAxiosError } from "axios";

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

export const startGuestInterview = (): Promise<NewInterviewResponse> =>
  interviewApiInstance
    .post("/interviews/guest", null, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      withCredentials: false
    })
    .then((response) => response.data)
    .catch((error) => {
      if (isAxiosError(error)) {
        if (error.response?.status === 400) {
          throw new Error(error.response.data.message);
        }
      }
      throw new Error(
        "면접 생성 중 오류가 발생했어요. 잠시 후 다시 시도해주세요."
      );
    });

export type { NewInterviewResponse, NewInterviewRequest };
