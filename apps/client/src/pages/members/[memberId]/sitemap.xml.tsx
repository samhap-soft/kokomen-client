import { getServerSideSitemapLegacy } from "next-sitemap";
import { GetServerSidePropsContext } from "next";
import { getMemberInterviews } from "@/domains/members/api";
import { parseNumericId } from "@/utils/routeParams";

const MAX_INTERVIEW_COUNT = 100000;
type PageParams = {
  memberId: string;
};
export const getServerSideProps = async (
  ctx: GetServerSidePropsContext<PageParams>
) => {
  // 숫자가 아닌 memberId(스캐너 퍼징 등)로 API를 호출하면 member_id=NaN이 전달되므로 먼저 걸러낸다.
  const memberId = parseNumericId(ctx.params?.memberId);
  if (memberId === null) {
    return {
      notFound: true
    };
  }

  const interviewList = await getMemberInterviews(
    memberId,
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
