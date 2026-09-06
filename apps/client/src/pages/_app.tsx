import "@/styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";
import { JSX } from "react";
import localFont from "next/font/local";
import { Toaster } from "@kokomen/ui";
import { ErrorBoundary } from "@sentry/nextjs";
import ErrorFallback from "@/shared/errorFallback";
import FeedbackButton from "@/shared/feedbackButton";
import ResumeStoreProvider from "@/domains/resume/context/resumeStore";
import ResumeBasedInterviewStoreProvider from "@/domains/resume/context/resumeBasedInterviewStore";
import ResumeAnalysisStoreProvider from "@/domains/resume/context/resumeAnalysisStore";

// Figma Foundation/Typography 기준 폰트. Regular/Medium/SemiBold/Bold 4종만
// 사용하므로(font-normal/medium/semibold/bold) 나머지 굵기는 싣지 않는다.
// 한글 전체 글리프 때문에 굵기당 약 780KB이므로 preload 대신 실제 사용 시점에
// 받도록 하고, 받는 동안에는 --font-sans 의 fallback 스택으로 그린다.
//
// Pages Router 에서는 next/font 를 _document 에서 쓸 수 없어 여기서 선언한다.
// 래퍼 엘리먼트에 className 을 얹으면 하위 페이지의 높이 체인이 바뀌므로
// html 에 CSS 변수만 주입하고, packages/ui 의 --font-sans 가 이 변수를 읽는다.
// eslint-disable-next-line @rushstack/typedef-var
const pretendard = localFont({
  src: [
    {
      path: "../../public/fonts/Pretendard-Regular.woff2",
      weight: "400",
      style: "normal"
    },
    {
      path: "../../public/fonts/Pretendard-Medium.woff2",
      weight: "500",
      style: "normal"
    },
    {
      path: "../../public/fonts/Pretendard-SemiBold.woff2",
      weight: "600",
      style: "normal"
    },
    {
      path: "../../public/fonts/Pretendard-Bold.woff2",
      weight: "700",
      style: "normal"
    }
  ],
  display: "swap",
  preload: false,
  fallback: [
    "-apple-system",
    "BlinkMacSystemFont",
    "system-ui",
    "Apple SD Gothic Neo",
    "Malgun Gothic",
    "sans-serif"
  ]
});

const queryClient: QueryClient = new QueryClient();

// eslint-disable-next-line @typescript-eslint/naming-convention
export default function App({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      {/* eslint-disable-next-line react/no-unknown-property -- styled-jsx */}
      <style jsx global>{`
        html {
          --font-pretendard: ${pretendard.style.fontFamily};
        }
      `}</style>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary fallback={<ErrorFallback />}>
          <Toaster>
            <ResumeStoreProvider>
              <ResumeBasedInterviewStoreProvider>
                <ResumeAnalysisStoreProvider>
                  <Component {...pageProps} />
                  <FeedbackButton />
                </ResumeAnalysisStoreProvider>
              </ResumeBasedInterviewStoreProvider>
            </ResumeStoreProvider>
          </Toaster>
        </ErrorBoundary>
      </QueryClientProvider>
    </>
  );
}
