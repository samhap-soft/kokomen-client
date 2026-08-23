import { Html, Head, Main, NextScript } from "next/document";
import { JSX } from "react";

export default function Document(): JSX.Element {
  return (
    <Html lang="ko">
      <Head />
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
