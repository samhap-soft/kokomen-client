import Head from "next/head";
import { JSX, ReactNode } from "react";

type SEOprops = {
  title?: string;
  description?: string;
  image?: string;
  pathname?: string;
  children?: ReactNode;
  robots?:
    | "noindex"
    | "index"
    | "noindex, nofollow"
    | "index, follow"
    | "noindex, follow"
    | "noindex, nofollow, noarchive"
    | "index, nofollow";
};

export const SEO = ({
  title,
  description,
  image,
  pathname,
  children,
  robots,
}: SEOprops): JSX.Element => {
  return (
    <Head>
      <title>
        {title
          ? `꼬꼬면 | ${title}`
          : "꼬꼬면 - 개발자를 위한 AI 모의면접 서비스"}
      </title>
      <meta
        name="description"
        content={description ?? "개발자를 위한 AI 모의면접 서비스"}
      />
      <meta name="og:title" content={title ? `꼬꼬면 | ${title}` : "꼬꼬면"} />
      <meta
        name="og:description"
        content={description ?? "개발자를 위한 AI 모의면접 서비스"}
      />
      <meta name="og:image" content={image ?? "/og-main.png"} />
      <meta
        name="og:url"
        content={`${process.env.NEXT_PUBLIC_BASE_URL}${pathname}`}
      />
      <meta name="og:type" content="website" />
      <meta name="og:locale" content="ko_KR" />
      <meta name="og:site_name" content="꼬꼬면" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="robots" content={robots ?? "noindex, nofollow"} />
      <link rel="icon" href="/favicon.ico" />

      {children}
    </Head>
  );
};
