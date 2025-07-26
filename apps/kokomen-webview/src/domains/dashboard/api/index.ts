import { InterviewHistory } from "@kokomen/types/dashboard";
import axios, { AxiosInstance } from "axios";

const dashboardServerInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true
});

export const getInterviewHistory = async ({
  page = 0,
  size = 10,
  sort = "desc",
  range = "ALL"
}: {
  page: number;
  size: number;
  sort: "asc" | "desc";
  range: "IN_PROGRESS" | "FINISHED" | "ALL";
}): Promise<InterviewHistory[]> => {
  const { data } = await dashboardServerInstance.get("/interviews/me", {
    params: {
      page,
      size,
      sort: sort === "desc" ? "id,desc" : "id,asc",
      state: range === "ALL" ? undefined : range
    }
  });
  return data;
};
