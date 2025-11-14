import { getServerSideSitemapLegacy } from "next-sitemap";
import { GetServerSidePropsContext } from "next";
import { getMemberInterviews } from "@/domains/members/api";

const MAX_INTERVIEW_COUNT = 100000;
type PageParams = {
  memberId: string;
};
export const getServerSideProps = async (
  ctx: GetServerSidePropsContext<PageParams>
) => {
  const { memberId } = ctx.params as { memberId: string };
  if (!memberId) {
    return {
      notFound: true
    };
  }

  const interviewList = await getMemberInterviews(
    Number(memberId),
    0,
    "desc",
    MAX_INTERVIEW_COUNT
  );
  return getServerSideSitemapLegacy(
    ctx,
    interviewList.interviewSummaries.map((interview) => ({
      loc: `${process.env.NEXT_PUBLIC_BASE_URL}/members/interviews/${interview.interviewId}`,
      lastmod: new Date().toISOString(),
      changefreq: "daily",
      priority: 0.8
    }))
  );
};

// Default export to prevent next.js errors
export default function Sitemap() {}
