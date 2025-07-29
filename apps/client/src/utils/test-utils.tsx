// utils/test-utils.tsx
import React, { JSX } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@kokomen/ui/components/toast/toaster";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

// MSW 서버 설정
export const server = setupServer();

// 전역 테스트 설정
beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0
      },
      mutations: {
        retry: false
      }
    }
  });

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  queryClient?: QueryClient;
}

export function renderWithProviders(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const { queryClient = createTestQueryClient(), ...renderOptions } = options;

  function Wrapper({ children }: { children: React.ReactNode }): JSX.Element {
    return (
      <QueryClientProvider client={queryClient}>
        <Toaster>{children}</Toaster>
      </QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient
  };
}

// MSW 헬퍼 함수들
export const mockApi = {
  memberInterviews: (memberId: number, interviews: any) => {
    server.use(
      http.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/interviews`,
        ({ request }) => {
          const url = new URL(request.url);
          const memberIdParam = url.searchParams.get("member_id");

          if (memberIdParam === memberId.toString()) {
            return HttpResponse.json(interviews);
          }

          return HttpResponse.json(
            { error: "Member not found" },
            { status: 404 }
          );
        }
      )
    );
  },
  memberInterviewsError: (
    memberId: number,
    status: number,
    message: string
  ) => {
    server.use(
      http.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/interviews`,
        ({ request }) => {
          const url = new URL(request.url);
          const memberIdParam = url.searchParams.get("member_id");

          if (memberIdParam === memberId.toString()) {
            return HttpResponse.json({ message }, { status });
          }

          return HttpResponse.json(
            { error: "Member not found" },
            { status: 404 }
          );
        }
      )
    );
  },
  userInfo: (user: any) => {
    server.use(
      http.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, () => {
        return HttpResponse.json(user);
      })
    );
  },
  userInfoError: (status: number, message: string) => {
    server.use(
      http.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, () => {
        return HttpResponse.json({ message }, { status });
      })
    );
  }
};
