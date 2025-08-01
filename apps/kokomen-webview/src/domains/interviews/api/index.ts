import { Interview } from "@kokomen/types";
import axios, { AxiosInstance } from "axios";
import type { CamelCasedProperties } from "@kokomen/utils/general/convertConvention";
import { mapToCamelCase } from "@kokomen/utils/general/convertConvention";

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

export const getInterview = async (
  interviewId: string
): Promise<CamelCasedProperties<Interview>> => {
  return interviewApiInstance
    .get(`/interviews/${interviewId}/check`)
    .then((res) => ({ interviewId: Number(interviewId), ...res.data }))
    .then(mapToCamelCase);
};

export type { NewInterviewResponse, NewInterviewRequest };
