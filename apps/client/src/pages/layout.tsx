import localFont from "next/font/local";
import React, { JSX } from "react";

// Figma Foundation/Typography 기준 폰트. Regular/Medium/SemiBold/Bold 4종만
// 사용하므로(font-normal/medium/semibold/bold) 나머지 굵기는 싣지 않는다.
// 한글 전체 글리프 때문에 굵기당 약 780KB이므로 preload 대신 실제 사용 시점에
// 받도록 하고, 받는 동안에는 fallback 스택으로 그린다.
// eslint-disable-next-line @rushstack/typedef-var
const pretendard = localFont({
  src: [
    {
      path: "../../public/fonts/Pretendard-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Pretendard-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Pretendard-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/Pretendard-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-pretendard",
  display: "swap",
  preload: false,
  fallback: [
    "-apple-system",
    "BlinkMacSystemFont",
    "system-ui",
    "Apple SD Gothic Neo",
    "Malgun Gothic",
    "sans-serif",
  ],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="ko" className={`${pretendard.variable} font-sans`}>
      <body>{children}</body>
    </html>
  );
}
