import { getServerSideSitemapLegacy } from "next-sitemap";
import { GetServerSideProps } from "next";
import { getPaginatedRankList } from "@/domains/members/api";
import { SitemapField } from "@kokomen/types";

const MAX_RANK_COUNT = 100000;
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const rankList: SitemapField[] = await getPaginatedRankList(
    0,
    MAX_RANK_COUNT
  ).then((res) =>
    res.data.map((rank) => ({
      loc: `${process.env.NEXT_PUBLIC_BASE_URL}/members/${rank.id}`,
      lastmod: new Date().toISOString(),
      changefreq: "daily",
      priority: 0.8
    }))
  );
  return getServerSideSitemapLegacy(ctx, rankList);
};

// Default export to prevent next.js errors
export default function Sitemap() {}
