import { Interview, InterviewMode, InterviewQuestion } from "@kokomen/types";
import axios, { AxiosInstance } from "axios";

const questionApiInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_V3_API_BASE_URL
});

export const getQuestions = async (
  category: string
): Promise<InterviewQuestion[]> => {
  return questionApiInstance
    .get<InterviewQuestion[]>(`/interview/questions?category=${category}`)
    .then((res) => res.data);
};

export const createCustomInterview = async ({
  rootQuestionId,
  maxQuestionCount,
  mode
}: {
  rootQuestionId: number;
  maxQuestionCount: number;
  mode: InterviewMode;
}): Promise<Interview> => {
  return questionApiInstance
    .post<Interview>(
      "/interview/custom",
      {
        rootQuestionId,
        maxQuestionCount,
        mode
      },
      {
        withCredentials: true
      }
    )
    .then((res) => res.data);
};
