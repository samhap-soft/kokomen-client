import { getInterviewReport } from "@/domains/interviewReport/api/report";
import { FeedbackAccordion } from "@/domains/interviewReport/components/feedbackAccordion";
import { InterviewReport } from "@/domains/interviewReport/types";
import {
  GetServerSideProps,
  GetServerSidePropsResult,
  InferGetServerSidePropsType,
} from "next";
import { ParsedUrlQuery } from "querystring";
import { Layout } from "@kokomen/ui/components/layout";
import { Button } from "@kokomen/ui/components/button";
import { useRouter } from "next/router";
import { JSX } from "react";
import Header from "@/shared/header";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Home,
  Star,
  Target,
} from "lucide-react";
import { withCheckInServer } from "@/utils/auth";
import { getUserInfo } from "@/domains/auth/api";
import { User } from "@/domains/auth/types";
import { SEO } from "@/shared/seo";

export default function MyInterviewResultPage({
  report,
  userInfo,
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  const navigate = useRouter();
  const scoreDiff = report.user_cur_score - report.user_prev_score;
  const isScoreImproved = scoreDiff > 0;

  const handleGoHome = () => {
    navigate.push({ pathname: "/" });
  };

  return (
    <>
      <SEO
        title="모의 면접 결과"
        description="모의 면접을 완료하셨습니다! 성과를 확인하고 다음 단계로 나아가세요."
        robots="noindex, nofollow, noarchive"
      />
      <Layout>
        <Header user={userInfo} />

        <main className="min-h-screen bg-gradient-to-br from-primary-bg via-bg-base to-primary-bg p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* 헤더 섹션 */}
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary to-primary-active rounded-full mb-6 shadow-lg">
                <Trophy className="w-10 h-10 text-text-light-solid" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-text-heading">
                면접 결과
              </h1>
              <p className="text-text-description text-lg max-w-2xl mx-auto">
                면접을 완료하셨습니다! 성과를 확인하고 다음 단계로 나아가세요.
              </p>
            </div>

            {/* 최종 점수 섹션 */}
            <div className="bg-bg-elevated rounded-2xl shadow-lg p-8 border border-border">
              <h2 className="text-2xl font-bold text-center mb-8 flex items-center justify-center gap-3">
                <Star className="w-7 h-7 text-warning" />
                <span className="text-text-heading">최종 점수</span>
              </h2>
              <div className="flex items-center justify-center space-x-8 mb-8">
                <div className="text-center">
                  <p className="text-sm text-text-description mb-3">
                    이전 점수
                  </p>
                  <div className="text-5xl md:text-6xl font-bold text-text-tertiary">
                    {report.user_prev_score}
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-3xl text-text-tertiary mb-3">→</div>
                  {isScoreImproved ? (
                    <TrendingUp className="w-8 h-8 text-success" />
                  ) : (
                    <TrendingDown className="w-8 h-8 text-error" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm text-text-description mb-3">
                    현재 점수
                  </p>
                  <div className="text-5xl md:text-6xl font-bold text-primary">
                    {report.user_cur_score}
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div
                  className={`inline-flex items-center gap-3 px-6 py-3 rounded-full text-base font-semibold shadow-sm ${
                    isScoreImproved
                      ? "bg-success-bg text-success-text border border-success-border"
                      : "bg-error-bg text-error-text border border-error-border"
                  }`}
                >
                  {isScoreImproved ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )}
                  {isScoreImproved ? "+" : ""}
                  {scoreDiff}점
                </div>
              </div>
            </div>

            {/* 보완할 점 섹션 */}
            <div className="bg-bg-elevated rounded-2xl shadow-lg p-8 border border-border">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <div className="w-2 h-10 bg-gradient-to-b from-primary to-primary-active rounded-full"></div>
                <span className="text-text-heading">보완할 점</span>
              </h2>
              <div className="bg-primary-bg p-8 rounded-xl border-l-4 border-primary">
                <p className="text-text-primary leading-relaxed mb-6 text-lg">
                  {report.total_feedback}
                </p>
                <div className="text-right">
                  <span className="inline-flex items-center gap-2 bg-bg-elevated px-6 py-3 rounded-full shadow-sm border border-border">
                    <Target className="w-5 h-5 text-primary" />
                    <span className="text-xl font-semibold text-primary">
                      총점: {report.total_score}점
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* 피드백 섹션 */}
            <div className="bg-bg-elevated rounded-2xl shadow-lg p-8 border border-border">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <div className="w-2 h-10 bg-gradient-to-b from-success to-success-active rounded-full"></div>
                <span className="text-text-heading">각 항목별 피드백</span>
              </h2>
              <FeedbackAccordion feedbacks={report.feedbacks} />
            </div>

            {/* 홈으로 버튼 */}
            <div className="text-center pt-4">
              <Button
                size="large"
                onClick={handleGoHome}
                className="bg-primary hover:bg-primary-hover text-text-light-solid px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0"
              >
                <Home className="w-6 h-6 mr-3" />
                홈으로 돌아가기
              </Button>
            </div>
          </div>
        </main>
      </Layout>
    </>
  );
}

interface PageParams extends ParsedUrlQuery {
  interviewId: string;
}
export const getServerSideProps: GetServerSideProps<
  { report: InterviewReport; userInfo: User | null },
  PageParams
> = async (
  context
): Promise<
  GetServerSidePropsResult<{ report: InterviewReport; userInfo: User | null }>
> => {
  const interviewId = context.params?.interviewId;
  if (!interviewId) {
    return {
      notFound: true,
    };
  }
  return withCheckInServer(
    async () => {
      const [report, userInfo] = await Promise.all([
        getInterviewReport(context.req.cookies, interviewId as string),
        getUserInfo(context),
      ]);
      return {
        data: {
          report: report.data,
          userInfo: userInfo.data,
        },
      };
    },
    {
      redirectPathWhenUnauthorized: "/interviews",
    }
  );
};
