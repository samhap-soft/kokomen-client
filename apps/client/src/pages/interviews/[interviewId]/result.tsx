import {
  getInterviewReport,
  getGuestInterviewReport
} from "@/domains/interviewReport/api/report";
import { FeedbackAccordion } from "@/domains/interviewReport/components/feedbackAccordion";
import { InterviewReport } from "@kokomen/types";
import {
  GetServerSideProps,
  GetServerSidePropsResult,
  InferGetServerSidePropsType
} from "next";
import { ParsedUrlQuery } from "querystring";
import { Layout, Score } from "@kokomen/ui";
import { Button } from "@kokomen/ui";
import { stripCodeBlocksForPreview } from "@kokomen/ui";
import { useRouter } from "next/router";
import { JSX } from "react";
import Header from "@/shared/header";
import { TrendingUp, TrendingDown, Target, LogIn, Lock } from "lucide-react";
import { withCheckInServer } from "@/utils/auth";
import { getClientIp } from "@/utils/clientIp";
import { getUserInfo } from "@/domains/auth/api";
import { SEO } from "@/shared/seo";
import { UserInfo } from "@kokomen/types";
import Link from "next/link";
import { isAxiosError } from "axios";
import PostingPopup from "@/shared/postingPopup";

export default function MyInterviewResultPage({
  report,
  userInfo,
  isGuest
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  const navigate = useRouter();
  const scoreDiff = report.user_cur_score - report.user_prev_score;
  const isScoreImproved = scoreDiff > 0;

  return (
    <>
      <SEO
        title="모의 면접 결과"
        description="모의 면접을 완료하셨습니다! 성과를 확인하고 다음 단계로 나아가세요."
        robots="noindex, nofollow, noarchive"
      />
      <Layout>
        <Header user={userInfo} />

        <main className="min-h-screen p-4 md:p-8">
          <section className="max-w-4xl mx-auto space-y-8">
            {/* 헤더 섹션 */}
            <div className="text-center space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-text-heading">
                면접 결과
              </h1>
              <p className="text-text-description text-lg max-w-2xl mx-auto">
                면접을 완료하셨습니다! 피드백을 보고 보완해보세요.
              </p>
            </div>

            {/* 최종 점수 섹션 */}
            {!isGuest && (
              <section className="bg-bg-elevated rounded-2xl border border-border overflow-hidden">
                <div className="px-6 py-4 border-b border-border-secondary bg-fill-quaternary">
                  <h2 className="text-xl font-semibold flex items-center gap-3 text-text-heading">
                    <div className="w-1 h-6 bg-warning rounded-full"></div>
                    최종 점수
                  </h2>
                </div>
                <div className="p-6">
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
                      <div className="text-5xl md:text-6xl font-bold text-blue-6">
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
                    <p className="text-xs text-text-tertiary mt-3">
                      한 번의 면접으로 얻거나 잃을 수 있는 점수는 -100점 ~
                      +100점 범위예요.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {report.root_question_reference_answers.length > 0 && (
              <section className="bg-bg-elevated rounded-2xl border border-border overflow-hidden">
                <div className="px-6 py-4 border-b border-border-secondary bg-fill-quaternary">
                  <h2 className="text-xl font-semibold flex items-center gap-3 text-text-heading">
                    <div className="w-1 h-6 bg-primary rounded-full"></div>
                    참고하기 좋은 인터뷰
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  {report.root_question_reference_answers.map(
                    (reference, idx) => (
                      <div
                        key={`reference-${reference.interview_id}-${idx}`}
                        className="bg-fill-tertiary rounded-lg p-4 border border-border-secondary"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-text-secondary text-sm font-medium">
                              {reference.nickname}
                            </span>
                            <Score rank={reference.answer_rank} />
                          </div>
                          <Link
                            href={`/members/interviews/${reference.interview_id}`}
                            className="bg-primary-light text-primary text-sm hover:text-primary-text-hover transition-colors"
                          >
                            자세히 보기 →
                          </Link>
                        </div>
                        <div className="text-text-primary text-base leading-relaxed whitespace-wrap break-words line-clamp-1">
                          {stripCodeBlocksForPreview(reference.answer_content)}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </section>
            )}

            {/* 보완할 점 섹션 */}
            <section className="bg-bg-elevated rounded-2xl border border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-border-secondary bg-fill-quaternary">
                <h2 className="text-xl font-semibold flex items-center gap-3 text-text-heading">
                  <div className="w-1 h-6 rounded-full"></div>
                  보완할 점
                </h2>
              </div>
              <div className="p-6">
                <div className="p-6 rounded-lg">
                  <p className="text-text-primary leading-relaxed mb-4 text-base">
                    {report.total_feedback}
                  </p>
                  <div className="flex justify-end">
                    <div className="inline-flex items-center gap-2 bg-bg-elevated px-4 py-2 rounded-lg border border-border">
                      <Target className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-primary">
                        총점: {report.total_score}점
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 피드백 섹션 */}
            <section className="bg-bg-elevated rounded-2xl border border-border">
              <div className="px-6 py-4 border-b border-border-secondary bg-fill-quaternary rounded-t-2xl">
                <h2 className="text-xl font-semibold flex items-center gap-3 text-text-heading">
                  <div className="w-1 h-6 bg-success rounded-full"></div>각
                  항목별 피드백
                </h2>
              </div>
              <div className="p-6">
                {isGuest ? (
                  <div className="space-y-4">
                    <FeedbackAccordion
                      feedbacks={report.feedbacks.slice(0, 1)}
                      isGuest
                      parseCode={report.include_live_coding}
                    />
                    {report.feedbacks.length > 1 && (
                      <div className="relative">
                        <div className="blur-sm pointer-events-none select-none">
                          <FeedbackAccordion
                            feedbacks={report.feedbacks.slice(1)}
                            parseCode={report.include_live_coding}
                          />
                        </div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 rounded-xl">
                          <Lock className="w-8 h-8 text-text-tertiary mb-3" />
                          <p className="text-sm text-text-secondary font-medium mb-4">
                            나머지 피드백은 로그인 후 확인할 수 있어요
                          </p>
                          <Button
                            variant="primary"
                            size="large"
                            onClick={() =>
                              navigate.push("/login?redirectTo=/interviews")
                            }
                          >
                            <LogIn className="w-4 h-4 mr-2" />
                            로그인하고 면접 체험하기
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <FeedbackAccordion
                    feedbacks={report.feedbacks}
                    parseCode={report.include_live_coding}
                  />
                )}
              </div>
            </section>

            {/* 하단 버튼 */}
            <div className="text-center pt-6 flex flex-col gap-4">
              <Button
                size="large"
                onClick={() => navigate.push("/")}
                variant={"soft"}
                className="w-full"
              >
                홈으로 돌아가기
              </Button>
              {isGuest ? (
                <Button
                  size="large"
                  onClick={() => navigate.push("/login?redirectTo=/interviews")}
                  variant={"primary"}
                  className="w-full"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  로그인하고 면접 체험하기
                </Button>
              ) : (
                <Button
                  size="large"
                  onClick={() => navigate.push("/dashboard")}
                  variant={"primary"}
                  className="w-full"
                >
                  마이페이지로 이동
                </Button>
              )}
            </div>
          </section>
        </main>
        <PostingPopup />
      </Layout>
    </>
  );
}

interface PageParams extends ParsedUrlQuery {
  interviewId: string;
}
export const getServerSideProps: GetServerSideProps<
  { report: InterviewReport; userInfo: UserInfo | null; isGuest: boolean },
  PageParams
> = async (
  context
): Promise<
  GetServerSidePropsResult<{
    report: InterviewReport;
    userInfo: UserInfo | null;
    isGuest: boolean;
  }>
> => {
  const interviewId = context.params?.interviewId;
  if (!interviewId) {
    return {
      notFound: true
    };
  }

  const hasSession = !!context.req.cookies.JSESSIONID;

  if (hasSession) {
    return withCheckInServer(
      async () => {
        const [report, userInfo] = await Promise.all([
          getInterviewReport(context.req.cookies, interviewId as string),
          getUserInfo(context)
        ]);
        return {
          data: {
            report: report.data,
            userInfo: userInfo.data,
            isGuest: false
          }
        };
      },
      {
        redirectPathWhenUnauthorized: "/interviews"
      }
    );
  }

  try {
    const clientIp = getClientIp(context.req);
    console.log("clientIp for guest interview report", clientIp);
    const report = await getGuestInterviewReport(
      interviewId as string,
      clientIp
    );
    return {
      props: {
        report: report.data,
        userInfo: null,
        isGuest: true
      }
    };
  } catch (error) {
    console.error("error for guest interview report", JSON.stringify(error));
    if (isAxiosError(error) && error.response?.status === 404) {
      return { notFound: true };
    }
    return {
      redirect: {
        destination: "/interviews",
        permanent: false
      }
    };
  }
};
