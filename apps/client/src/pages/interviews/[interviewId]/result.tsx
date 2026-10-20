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
import {
  ArrowForwardIcon,
  Badge,
  Button,
  ChevronRightIcon,
  Chip,
  stripCodeBlocksForPreview,
  textButtonVariants
} from "@kokomen/ui";
import { useRouter } from "next/router";
import { JSX } from "react";
import Header from "@/shared/header";
import { Footer } from "@/shared/footer";
import {
  isWeakRank,
  RankLabel
} from "@/domains/interviewReport/components/rankLabel";
import { withCheckInServer } from "@/utils/auth";
import { getClientIp } from "@/utils/clientIp";
import { getUserInfo } from "@/domains/auth/api";
import { SEO } from "@/shared/seo";
import { UserInfo } from "@kokomen/types";
import Link from "next/link";
import { isAxiosError } from "axios";
import { parseNumericId } from "@/utils/routeParams";

// total_feedback 의 첫 문장을 요약 헤드라인으로, 나머지를 본문으로 쓴다.
const splitTotalFeedback = (
  totalFeedback: string
): { headline: string | null; body: string } => {
  const match = totalFeedback.trim().match(/^(.+?[.!?])\s+([\s\S]+)$/);
  if (!match) return { headline: null, body: totalFeedback };
  return { headline: match[1], body: match[2] };
};

const cardClassName: string =
  "rounded-[20px] border border-border bg-bg-elevated";

export default function MyInterviewResultPage({
  report,
  userInfo,
  isGuest
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  const navigate = useRouter();
  const scoreDiff = report.user_cur_score - report.user_prev_score;
  const isScoreImproved = scoreDiff > 0;
  const { headline, body } = splitTotalFeedback(report.total_feedback);
  const weakFeedbacks = report.feedbacks.filter((feedback) =>
    isWeakRank(feedback.answer_rank)
  );
  const loginPath = "/login?redirectTo=/interviews";

  return (
    <>
      <SEO
        title="모의 면접 결과"
        description="모의 면접을 완료하셨습니다! 성과를 확인하고 다음 단계로 나아가세요."
        robots="noindex, nofollow, noarchive"
      />
      <div className="min-h-screen">
        <Header user={userInfo} />

        <main className="mx-auto flex w-full max-w-[1182px] flex-col gap-8 px-5 pt-8 pb-[100px] xl:px-0">
          {/* 제목과 이동 */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-3">
              <h1 className="text-3xl font-bold text-text-primary">
                면접 결과
              </h1>
              <p className="text-base text-text-secondary">
                수고하셨어요! 오늘의 피드백으로 다음 답변을 더 탄탄하게
                준비해봐요.
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <Button
                size="large"
                variant="secondary"
                onClick={() => navigate.push("/")}
              >
                홈으로
              </Button>
              <Button
                size="large"
                variant="primary"
                onClick={() =>
                  navigate.push(isGuest ? loginPath : "/dashboard")
                }
              >
                {isGuest ? "로그인하기" : "마이페이지"}
              </Button>
            </div>
          </div>

          {/* 면접 정보 */}
          <ul className="flex flex-wrap gap-2" aria-label="면접 정보">
            {[
              report.interview_mode === "VOICE" ? "음성 면접" : "텍스트 면접",
              `${report.feedbacks.length}문항`,
              ...(report.include_live_coding ? ["라이브 코딩"] : [])
            ].map((label) => (
              <li key={label}>
                <Chip size="default" className="pointer-events-none" tabIndex={-1}>
                  {label}
                </Chip>
              </li>
            ))}
          </ul>

          {/* 최종 점수 */}
          <section
            className={`${cardClassName} flex flex-col gap-6 p-6 md:p-8 lg:flex-row`}
          >
            {!isGuest && (
              <div className="flex flex-col items-start gap-3 lg:w-[428px] lg:shrink-0">
                <h2 className="text-lg font-semibold text-text-primary">
                  최종 점수
                </h2>
                <div className="flex items-center gap-6">
                  <div className="flex flex-col gap-1 text-text-secondary">
                    <p className="text-sm">이전 점수</p>
                    <p className="text-5xl leading-9 font-bold">
                      {report.user_prev_score}
                    </p>
                  </div>
                  <ArrowForwardIcon
                    size={28}
                    className="text-text-secondary"
                  />
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-text-secondary">현재 점수</p>
                    <p className="text-5xl leading-9 font-bold text-primary-text">
                      {report.user_cur_score}
                    </p>
                  </div>
                </div>
                <Badge
                  appearance="weak"
                  type={isScoreImproved ? "success" : scoreDiff < 0 ? "error" : "neutral"}
                >
                  {scoreDiff === 0
                    ? "이전과 점수가 같아요"
                    : `이전보다 ${Math.abs(scoreDiff)}점 ${isScoreImproved ? "증가" : "감소"}`}
                </Badge>
                <p className="text-sm text-text-secondary">
                  한 번의 면접으로 변하는 점수는 -100점 ~ +100점이에요.
                </p>
              </div>
            )}
            <div className="flex flex-1 flex-col gap-4 rounded-[20px] bg-bg-elevated lg:p-6">
              <div className="flex flex-col gap-2.5">
                {headline && (
                  <p className="text-lg font-semibold text-text-primary">
                    {headline}
                  </p>
                )}
                <p className="whitespace-pre-line text-base text-text-secondary">
                  {body}
                </p>
              </div>
              <ul className="flex flex-wrap gap-x-5 gap-y-2">
                {report.feedbacks.map((feedback, idx) => (
                  <li
                    key={feedback.question_id}
                    className="flex flex-col gap-1"
                  >
                    <p className="text-sm text-text-secondary">
                      {idx + 1}번 질문
                    </p>
                    <RankLabel rank={feedback.answer_rank} />
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            {/* 질문별 피드백 */}
            <section className="flex min-w-0 flex-col gap-5 lg:w-[780px] lg:shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-text-primary">
                  질문별 피드백
                </h2>
                <p className="text-sm text-text-secondary">
                  {report.feedbacks.length}문항
                </p>
              </div>
              {isGuest ? (
                <div className="flex flex-col gap-5">
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
                          startIndex={1}
                          defaultOpenFirst={false}
                        />
                      </div>
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-[20px] bg-bg-elevated/60">
                        <p className="text-sm font-medium text-text-secondary">
                          나머지 피드백은 로그인 후 확인할 수 있어요
                        </p>
                        <Button
                          variant="primary"
                          size="large"
                          onClick={() => navigate.push(loginPath)}
                        >
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
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                  size="large"
                  onClick={() => navigate.push("/")}
                  variant={"secondary"}
                >
                  홈으로 돌아가기
                </Button>
                {isGuest ? (
                  <Button
                    size="large"
                    onClick={() => navigate.push(loginPath)}
                    variant={"primary"}
                  >
                    로그인하고 면접 체험하기
                  </Button>
                ) : (
                  <Button
                    size="large"
                    onClick={() => navigate.push("/dashboard")}
                    variant={"primary"}
                  >
                    마이페이지로 이동
                  </Button>
                )}
              </div>
            </section>

            <aside className="flex min-w-0 flex-col gap-6 lg:flex-1">
              {/* 보완할 점 */}
              <section className="flex flex-col gap-4 rounded-[20px] bg-primary-1 p-6">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-2xl font-bold text-text-primary">
                    다음 답변에서는
                  </h2>
                  {!isGuest && (
                    <Badge
                      appearance="weak"
                      type={scoreDiff < 0 ? "error" : "brand"}
                    >
                      {report.user_cur_rank} · {scoreDiff > 0 ? "+" : ""}
                      {scoreDiff}점
                    </Badge>
                  )}
                </div>
                {weakFeedbacks.length > 0 ? (
                  <ul className="flex flex-col gap-4">
                    {weakFeedbacks.map((feedback) => (
                      <li
                        key={feedback.question_id}
                        className="flex flex-col gap-1.5"
                      >
                        <p className="line-clamp-1 text-base font-semibold text-text-primary">
                          {stripCodeBlocksForPreview(feedback.question)}
                        </p>
                        <p className="line-clamp-2 text-sm text-text-secondary">
                          {feedback.answer_feedback}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-text-secondary">
                    모든 질문에서 B등급 이상을 받았어요. 지금처럼 개념과 근거를
                    함께 설명해 보세요.
                  </p>
                )}
              </section>

              {report.root_question_reference_answers.length > 0 && (
                <section
                  className={`${cardClassName} flex flex-col gap-5 p-6`}
                >
                  <div className="flex flex-col gap-1">
                    <h2 className="text-lg font-semibold text-text-primary">
                      참고하기 좋은 인터뷰
                    </h2>
                    <p className="text-sm text-text-secondary">
                      다른 답변의 설명 방식을 살펴보세요.
                    </p>
                  </div>
                  <ul className="flex flex-col gap-5">
                    {report.root_question_reference_answers.map(
                      (reference, idx) => (
                        <li
                          key={`reference-${reference.interview_id}-${idx}`}
                          className="flex flex-col gap-3 rounded-xl bg-bg-layout p-4"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-1">
                              <RankLabel rank={reference.answer_rank} />
                              <span className="truncate text-xs text-text-tertiary">
                                {reference.nickname}
                              </span>
                            </div>
                            <Link
                              href={`/members/interviews/${reference.interview_id}`}
                              className={textButtonVariants({
                                variant: "secondary-low",
                                size: "small",
                                className: "shrink-0"
                              })}
                            >
                              자세히 보기
                              <ChevronRightIcon />
                            </Link>
                          </div>
                          <p className="line-clamp-3 text-sm text-text-secondary">
                            {stripCodeBlocksForPreview(reference.answer_content)}
                          </p>
                        </li>
                      )
                    )}
                  </ul>
                </section>
              )}
            </aside>
          </div>
        </main>
        <Footer />
      </div>
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
  // 숫자가 아닌 interviewId(스캐너 퍼징 등)가 그대로 API 요청에 실리지 않도록 먼저 걸러낸다.
  const parsedInterviewId = parseNumericId(context.params?.interviewId);
  if (parsedInterviewId === null) {
    return {
      notFound: true
    };
  }
  const interviewId = String(parsedInterviewId);

  const hasSession = !!context.req.cookies.JSESSIONID;

  if (hasSession) {
    return withCheckInServer(
      async () => {
        const [report, userInfo] = await Promise.all([
          getInterviewReport(context.req.cookies, interviewId),
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
    const report = await getGuestInterviewReport(interviewId, clientIp);
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
