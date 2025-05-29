import axios, { AxiosResponse } from "axios";

export const interviewApiInstance = axios.create({
  baseURL: "http://13.124.13.60/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

interface NewInterviewResponse {
  interview_id: number;
  question_id: number;
  root_question: string;
}

export const startNewInterview = async (): Promise<
  AxiosResponse<NewInterviewResponse>
> => {
  return interviewApiInstance.post("/interviews", {
    categories: ["OPERATING_SYSTEM"],
  });
};
