import { mapToCamelCase } from "@/utils/convertConvention";
import { ArchivedResumeAndPortfolio } from "@kokomen/types";
import axios from "axios";

const archiveServerInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL + "/resumes",
  withCredentials: true
});

export const getArchivedResumes = (type?: "ALL" | "RESUME" | "PORTFOLIO") => {
  return archiveServerInstance
    .get<{
      resumes: ArchivedResumeAndPortfolio[];
      portfolios: ArchivedResumeAndPortfolio[];
    }>("", {
      params: {
        type: type ?? "ALL"
      }
    })
    .then((res) => mapToCamelCase(res.data));
};
