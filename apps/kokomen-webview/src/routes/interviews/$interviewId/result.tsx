import { createFileRoute, useParams, useRouter } from "@tanstack/react-router";
import { interviewKeys } from "@kokomen/utils/general/querykeys";
import { getInterviewReport } from "@/domains/reports/api/report";
import { LoadingFullScreen } from "@kokomen/ui/components/spinner";
import { useQuery } from "@tanstack/react-query";
import ErrorComponent from "@/common/components/ErrorComponent";
import {
  Home,
  Star,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy
} from "lucide-react";
import { FeedbackAccordion } from "@/domains/reports/components/feedbackAccordion";
import { Button } from "@kokomen/ui/components/button";

export const Route = createFileRoute("/interviews/$interviewId/result")({
  component: RouteComponent,
  pendingComponent: LoadingFullScreen
});

function RouteComponent() {
  const router = useRouter();
  const { interviewId } = useParams({
    from: "/interviews/$interviewId/result"
  });
  const {
    data: report,
    isError,
    isPending
  } = useQuery({
    queryKey: interviewKeys.resultByInterviewId(Number(interviewId)),
    queryFn: () => getInterviewReport(interviewId),
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
    retry: 1
  });

  if (isError) return <ErrorComponent />;
  if (isPending) return <LoadingFullScreen />;

  const scoreDiff = report?.userCurScore - report?.userPrevScore;
  const isScoreImproved = scoreDiff > 0;

  const handleGoHome = () => {
    router.navigate({ to: "/interviews", viewTransition: true });
  };

  return (
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
            면접을 완료하셨습니다! <br /> 부족한 부분을 확인하고 보완해보세요.
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
              <p className="text-sm text-text-description mb-3">이전 점수</p>
              <div className="text-5xl md:text-6xl font-bold text-text-tertiary">
                {report.userPrevScore}
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
              <p className="text-sm text-text-description mb-3">현재 점수</p>
              <div className="text-5xl md:text-6xl font-bold text-primary">
                {report.userCurScore}
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
              {report.totalFeedback}
            </p>
            <div className="text-right">
              <span className="inline-flex items-center gap-2 bg-bg-elevated px-6 py-3 rounded-full shadow-sm border border-border">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-xl font-semibold text-primary">
                  총점: {report.totalScore}점
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
            type="button"
            variant={"gradient"}
            onClick={handleGoHome}
            className="w-full"
          >
            <Home className="w-6 h-6 mr-3" />
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    </main>
  );
}
