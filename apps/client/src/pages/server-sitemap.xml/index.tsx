import { getServerSideSitemapIndexLegacy } from "next-sitemap";
import { GetServerSideProps } from "next";
import { getPaginatedRankList } from "@/domains/members/api";

const MAX_RANK_COUNT = 100000;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const rankList = await getPaginatedRankList(0, MAX_RANK_COUNT).then(
    (res) => res.data
  );

  const memberSitemaps = rankList.map(
    (rank) =>
      `${process.env.NEXT_PUBLIC_BASE_URL}/members/${rank.id}/sitemap.xml`
  );

  return getServerSideSitemapIndexLegacy(ctx, [
    `${process.env.NEXT_PUBLIC_BASE_URL}/sitemap/rank.xml`,
    ...memberSitemaps
  ]);
};

// Default export to prevent next.js errors
export default function SitemapIndex() {}
