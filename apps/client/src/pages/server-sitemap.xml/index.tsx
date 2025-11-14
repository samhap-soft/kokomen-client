import { getServerSideSitemapIndexLegacy } from "next-sitemap";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return getServerSideSitemapIndexLegacy(ctx, [
    `${process.env.NEXT_PUBLIC_BASE_URL}/sitemap/members.xml`,
    `${process.env.NEXT_PUBLIC_BASE_URL}/sitemap/rank.xml`
  ]);
};

// Default export to prevent next.js errors
export default function SitemapIndex() {}
