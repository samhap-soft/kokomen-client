import { Interview, InterviewMode } from "@kokomen/types";
import axios, { AxiosInstance } from "axios";
import type { CamelCasedProperties } from "@kokomen/utils";
import { mapToCamelCase } from "@kokomen/utils";

export const interviewApiInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
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
): Promise<CamelCasedProperties<NewInterviewResponse>> => {
  return interviewApiInstance
    .post("/interviews", data)
    .then((res) => ({
      interviewId: Number(res.data.interview_id),
      ...res.data
    }))
    .then(mapToCamelCase);
};

export const getInterview = async (
  interviewId: string,
  mode: InterviewMode
): Promise<CamelCasedProperties<Interview>> => {
  return interviewApiInstance
    .get(`/interviews/${interviewId}/check?mode=${mode}`)
    .then((res) => ({ interviewId: Number(interviewId), ...res.data }))
    .then(mapToCamelCase);
};

export type { NewInterviewResponse, NewInterviewRequest };
