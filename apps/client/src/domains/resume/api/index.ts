import { mapToCamelCase } from "@/utils/convertConvention";
import { ResumeInput, ResumeOutput } from "@kokomen/types";
import axios from "axios";

const resumeServerInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_V3_API_BASE_URL + "/resume",
  withCredentials: true
});

function submitResumeEvaluation(data: ResumeInput) {
  return resumeServerInstance
    .post<ResumeOutput>("/evaluation", data)
    .then((res) => res.data)
    .then(mapToCamelCase);
}

export { submitResumeEvaluation };
