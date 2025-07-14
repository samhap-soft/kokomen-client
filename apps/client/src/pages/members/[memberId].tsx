import { getUserInfo } from "@/domains/auth/api";
import { User } from "@/domains/auth/types";
import MemberInterviewHistory from "@/domains/members/components/memberInterviewHistory";
import {
  GetServerSideProps,
  GetServerSidePropsResult,
  InferGetServerSidePropsType,
} from "next";
import { Layout } from "@kokomen/ui/components/layout";
import Header from "@/shared/header";
import { JSX } from "react";
import { getMemberInterviews } from "@/domains/members/api";
import { MemberInterview } from "@/domains/members/types";
import { CamelCasedProperties } from "@/utils/convertConvention";
import { TrendingUp } from "lucide-react";
import { getRankDisplay, getPercentileDisplay } from "@/utils/rankDisplay";
import { SEO } from "@/shared/seo";

export default function MemberInterviewPage({
  memberId,
  user,
  interviews,
  sort,
  page,
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  const percentile = Math.round(
    (interviews.intervieweeRank / interviews.totalMemberCount) * 100
  );

  const rankDisplay = getRankDisplay(interviews.intervieweeRank);
  const RankIcon = rankDisplay.icon;

  return (
    <>
      <SEO
        title={`${interviews.intervieweeNickname}의 면접 기록`}
        description={`${interviews.intervieweeNickname}님의 면접 기록을 확인해보세요.`}
        robots="index, follow"
        pathname={`/members/${memberId}`}
      />
      <Layout>
        <Header user={user} />
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 ">
          {/* 멤버 정보 카드 */}
          <div className="bg-bg-elevated rounded-lg border border-border-secondary shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4 flex-col md:flex-row">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 ${rankDisplay.bgColor} rounded-full flex items-center justify-center`}
                >
                  <RankIcon className={`w-6 h-6 ${rankDisplay.color}`} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-text-heading">
                    {interviews.intervieweeNickname}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="flex items-center gap-2 mb-1">
                    <RankIcon className={`w-4 h-4 ${rankDisplay.color}`} />
                    <span className="text-sm font-medium text-text-label">
                      랭킹
                    </span>
                  </div>
                  <div className={`text-lg font-bold ${rankDisplay.color}`}>
                    {interviews.intervieweeRank}위
                  </div>
                  <div className="text-xs text-text-tertiary">
                    / {interviews.totalMemberCount}명
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp
                      className={`w-4 h-4 ${getPercentileDisplay(percentile).color}`}
                    />
                    <span className="text-sm font-medium text-text-label">
                      상위
                    </span>
                  </div>
                  <div
                    className={`text-lg font-bold ${
                      getPercentileDisplay(percentile).color
                    }`}
                  >
                    {percentile}%
                  </div>
                  <div className="text-xs text-text-tertiary">백분위</div>
                </div>
              </div>
            </div>

            {/* 진행 바로 상위 퍼센트 시각화 */}
            <div className="mt-4 pt-4 border-t border-border-secondary">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-label">
                  전체 멤버 중 위치
                </span>
                <span
                  className={`text-sm font-medium ${
                    getPercentileDisplay(percentile).color
                  }`}
                >
                  상위 {percentile}%
                </span>
              </div>
              <div className="w-full bg-fill-tertiary rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-6 to-blue-6 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${100 - percentile}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-text-tertiary">
                <span>{interviews.totalMemberCount}위</span>
                <span>1위</span>
              </div>
            </div>
          </div>

          {/* 면접 기록 섹션 */}
          <div className="bg-bg-base rounded-lg border border-border-secondary shadow-sm p-6">
            <h2 className="text-xl font-bold text-text-heading mb-4">
              면접 기록
            </h2>
            <MemberInterviewHistory
              memberId={Number(memberId)}
              interviewSummaries={interviews.interviewSummaries}
              sort={sort}
              page={page}
              totalPageCount={interviews.totalPageCount}
            />
          </div>
        </div>
      </Layout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<{
  memberId: string;
  user: User | null;
  interviews: CamelCasedProperties<MemberInterview>;
  sort: "asc" | "desc";
  page: number;
}> = async (
  context
): Promise<
  GetServerSidePropsResult<{
    memberId: string;
    user: User | null;
    interviews: CamelCasedProperties<MemberInterview>;
    sort: "asc" | "desc";
    page: number;
  }>
> => {
  const { memberId } = context.params as { memberId: string };
  const { sort, page } = context.query as { sort: string; page: string };
  if (!memberId) {
    return {
      notFound: true,
    };
  }
  const sortOption = sort === "asc" ? "asc" : "desc";
  const pageOption = isNaN(Number(page)) ? 0 : Number(page);
  const [user, interviews] = await Promise.allSettled([
    getUserInfo(context),
    getMemberInterviews(Number(memberId), pageOption, sortOption),
  ]);

  if (interviews.status === "fulfilled") {
    if (user.status === "rejected") {
      return {
        props: {
          memberId,
          user: null,
          interviews: interviews.value,
          sort: sortOption,
          page: pageOption,
        },
      };
    }
    return {
      props: {
        memberId,
        user: user.value.data,
        interviews: interviews.value,
        sort: sortOption,
        page: pageOption,
      },
    };
  }

  return {
    notFound: true,
  };
};
