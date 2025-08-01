import { Category } from "@kokomen/types";
import { Rank } from "@kokomen/types";
import { server } from "mocks";
import { memberInterviews } from "mocks/api/members";
import { http, HttpResponse } from "msw";

export const mockApi = {
  categories: (categories: Category[]) => {
    server.use(
      http.get(`${import.meta.env.VITE_API_BASE_URL}/categories`, () => {
        return HttpResponse.json(categories);
      })
    );
  },
  ranking: (ranking: Rank[]) => {
    server.use(
      http.get(`${import.meta.env.VITE_API_BASE_URL}/members/ranking`, () => {
        return HttpResponse.json(ranking);
      })
    );
  },
  createInterview: (response: any, delayMs = 0) => {
    server.use(
      http.post(`${import.meta.env.VITE_API_BASE_URL}/interviews`, async () => {
        if (delayMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
        return HttpResponse.json(response);
      })
    );
  },
  createInterviewError: (status: number, message: string) => {
    server.use(
      http.post(`${import.meta.env.VITE_API_BASE_URL}/interviews`, () => {
        return HttpResponse.json({ message }, { status });
      })
    );
  },
  memberInterviews
};
