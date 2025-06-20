import localFont from "next/font/local";
import React, { JSX } from "react";

// eslint-disable-next-line @rushstack/typedef-var
const font = localFont({
  src: [
    {
      path: "../../public/fonts/sf_pro_bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/sf_pro_regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/sf_pro_medium.woff2",
      weight: "500",
      style: "normal",
    },
  ],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="ko" className={font.className}>
      <body>{children}</body>
    </html>
  );
}
