import { getResumeAnalyses } from "@/domains/resume/api/resumeAnalysis";
import { resumeAnalysisResultPath } from "@/domains/resume/utils/resumeAnalysisPath";
import { ResumeAnalysisList, ResumeAnalysisState } from "@kokomen/types";
import { resumeAnalysisKeys } from "@/utils/querykeys";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import {
  Calendar,
  Briefcase,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import PaginationButtons from "@/shared/paginationButtons";
import { formatDate } from "@/utils/date";
import React, { JSX } from "react";

// 평가가 끝나서 결과 화면에 보여줄 내용이 있는 상태.
// QUESTION_FAILED는 질문 생성만 실패했고 평가 결과는 유지된다.
const STATES_WITH_EVALUATION: ResumeAnalysisState[] = [
  "EVALUATION_COMPLETED",
  "COMPLETED",
  "QUESTION_FAILED"
];

const stateBadges: Record<
  ResumeAnalysisState,
  { label: string; className: string; icon: typeof CheckCircle }
> = {
  PENDING: {
    label: "분석중",
    className: "bg-yellow-100 text-yellow-800",
    icon: Clock
  },
  EVALUATION_COMPLETED: {
    label: "질문 생성중",
    className: "bg-blue-100 text-blue-800",
    icon: Clock
  },
  COMPLETED: {
    label: "완료",
    className: "bg-green-100 text-green-800",
    icon: CheckCircle
  },
  EVALUATION_FAILED: {
    label: "평가 실패",
    className: "bg-red-100 text-red-800",
    icon: XCircle
  },
  QUESTION_FAILED: {
    label: "질문 생성 실패",
    className: "bg-orange-100 text-orange-800",
    icon: XCircle
  }
};

function StateBadge({ state }: { state: ResumeAnalysisState }): JSX.Element {
  const badge = stateBadges[state];
  if (!badge) return <></>;
  const Icon = badge.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}
    >
      <Icon className="w-3 h-3" />
      {badge.label}
    </span>
  );
}

function HistoryHeader(): JSX.Element {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-text-heading mb-2">
        이력서 분석 히스토리
      </h1>
      <p className="text-text-secondary">이력서 분석 결과를 확인해보세요</p>
    </div>
  );
}

export default function ResumeEvaluationHistory(): JSX.Element {
  const router = useRouter();
  const page = Number(router.query.page) || 0;
  const size = 20;

  const { data, isLoading, isError } = useQuery<ResumeAnalysisList>({
    queryKey: resumeAnalysisKeys.history(page, size),
    queryFn: () => getResumeAnalyses(page, size)
  });

  const getScoreColor = (score: number): string => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (isLoading) {
    return (
      <div className="flex-1">
        <HistoryHeader />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-border p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex-1">
        <HistoryHeader />
        <div className="bg-white rounded-lg shadow-sm border border-border p-6 text-center">
          <p className="text-text-secondary">
            데이터를 불러오는 중 오류가 발생했습니다.
          </p>
        </div>
      </div>
    );
  }

  const analyses = data.data ?? [];

  return (
    <div className="flex-1">
      <HistoryHeader />

      {analyses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-border p-12 text-center">
          <Briefcase className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
          <p className="text-text-secondary text-lg mb-2">
            분석한 이력서가 없습니다
          </p>
          <p className="text-text-tertiary text-sm">
            이력서를 업로드하여 분석을 받아보세요
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {analyses.map((analysis) => {
            const hasResult = STATES_WITH_EVALUATION.includes(analysis.state);
            return (
              <div
                key={analysis.analysisId}
                className="bg-white rounded-lg shadow-sm border border-border p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-text-heading">
                        이력서 분석
                      </h3>
                      <StateBadge state={analysis.state} />
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(analysis.createdAt)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        <span className="font-medium">직무:</span>
                        <span>{analysis.jobPosition}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">연차:</span>
                        <span>{analysis.jobCareer}</span>
                      </div>
                      {analysis.questionCount > 0 && (
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          <span>면접 질문 {analysis.questionCount}개</span>
                        </div>
                      )}
                    </div>

                    {/* total_score는 평가 완료 이후에만 응답에 포함된다 */}
                    {analysis.totalScore !== undefined && (
                      <div className="flex items-center gap-2">
                        <TrendingUp
                          className={`w-4 h-4 ${getScoreColor(analysis.totalScore)}`}
                        />
                        <span
                          className={`text-lg font-bold ${getScoreColor(analysis.totalScore)}`}
                        >
                          총점: {analysis.totalScore}점
                        </span>
                      </div>
                    )}
                  </div>

                  {hasResult && (
                    <div className="md:ml-4 md:w-auto w-full">
                      <Link
                        href={resumeAnalysisResultPath(analysis.analysisId)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover transition-colors md:w-auto w-full justify-center"
                      >
                        결과 보기
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {data.totalPages > 1 && (
            <PaginationButtons
              totalPages={data.totalPages}
              currentPage={data.currentPage}
              basePath="dashboard"
              options={{}}
              hasNext={data.hasNext}
            />
          )}
        </div>
      )}
    </div>
  );
}
