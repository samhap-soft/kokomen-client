import { Interview } from "@/domains/interview/types";
import axios, { AxiosInstance, AxiosPromise } from "axios";
import { GetServerSidePropsContext } from "next";

export const interviewApiInstance: AxiosInstance = axios.create({
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
    data,
    {
      withCredentials: true,
    }
  );
  return responseData;
};

export const getInterview = async (
  interviewId: string,
  req: GetServerSidePropsContext["req"]
): AxiosPromise<Interview> => {
  return interviewApiInstance.get(`/interviews/${interviewId}`, {
    headers: {
      Cookie: req.headers.cookie || "",
    },
  });
};
export type { NewInterviewResponse, NewInterviewRequest };
