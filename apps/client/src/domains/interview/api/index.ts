import axios, { AxiosResponse } from "axios";

export const interviewApiInstance = axios.create({
  baseURL: "http://api-dev.kokomen.kr/api/v1",
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
