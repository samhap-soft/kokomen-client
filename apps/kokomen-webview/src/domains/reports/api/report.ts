import { InterviewReport } from "@kokomen/types/reports";
import type { CamelCasedProperties } from "@kokomen/utils/general/convertConvention";
import { mapToCamelCase } from "@kokomen/utils/general/convertConvention";
import axios, { AxiosInstance } from "axios";

const interviewApiInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true
});

function getInterviewReport(
  interview_id: string
): Promise<CamelCasedProperties<InterviewReport>> {
  return interviewApiInstance
    .get<InterviewReport>(`/interviews/${interview_id}/my-result`)
    .then((res) => res.data)
    .then(mapToCamelCase);
}

export { getInterviewReport };
