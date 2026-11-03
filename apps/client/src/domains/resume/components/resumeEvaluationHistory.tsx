import { getResumeAnalyses } from "@/domains/resume/api/resumeAnalysis";
import { formatDotDate } from "@/utils/date";
import { resumeAnalysisResultPath } from "@/domains/resume/utils/resumeAnalysisPath";
import {
  getRouterPage,
  setRouterPage
} from "@/domains/dashboard/utils/pageQuery";
import { ResumeAnalysisList, ResumeAnalysisState } from "@kokomen/types";
import { resumeAnalysisKeys } from "@/utils/querykeys";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import {
  Badge,
  buttonVariants,
  IBadgeProps,
  Pagination,
  Skeleton
} from "@kokomen/ui";
import Link from "next/link";
import React, { JSX } from "react";

const PAGE_SIZE: number = 20;

// 평가가 끝나서 결과 화면에 보여줄 내용이 있는 상태.
// QUESTION_FAILED는 질문 생성만 실패했고 평가 결과는 유지된다.
const STATES_WITH_EVALUATION: ResumeAnalysisState[] = [
  "EVALUATION_COMPLETED",
  "COMPLETED",
  "QUESTION_FAILED"
];

const stateBadges: Record<
  ResumeAnalysisState,
  { label: string; type: IBadgeProps["type"] }
> = {
  PENDING: { label: "분석중", type: "neutral" },
  EVALUATION_COMPLETED: { label: "질문 생성중", type: "neutral" },
  COMPLETED: { label: "완료", type: "brand" },
  EVALUATION_FAILED: { label: "평가 실패", type: "error" },
  QUESTION_FAILED: { label: "질문 생성 실패", type: "warning" }
};

function HistoryHeader(): JSX.Element {
  return (
    <h2 className="text-2xl font-bold text-text-primary">이력서 평가 기록</h2>
  );
}

export default function ResumeEvaluationHistory(): JSX.Element {
  const router = useRouter();
  const page = getRouterPage(router);

  const { data, isLoading, isError } = useQuery<ResumeAnalysisList>({
    queryKey: resumeAnalysisKeys.history(page, PAGE_SIZE),
    queryFn: () => getResumeAnalyses(page, PAGE_SIZE)
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <HistoryHeader />
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col gap-6">
        <HistoryHeader />
        <p className="py-12 text-center text-text-secondary">
          데이터를 불러오는 중 오류가 발생했습니다.
        </p>
      </div>
    );
  }

  const analyses = data.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <HistoryHeader />

      {analyses.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <p className="text-lg text-text-secondary">
            분석한 이력서가 없습니다
          </p>
          <p className="text-sm text-text-tertiary">
            이력서를 업로드하여 분석을 받아보세요
          </p>
        </div>
      ) : (
        <>
          <ul className="flex flex-col">
            {analyses.map((analysis) => {
              const hasResult = STATES_WITH_EVALUATION.includes(analysis.state);
              const badge = stateBadges[analysis.state];
              const meta: string[] = [
                formatDotDate(analysis.createdAt),
                analysis.jobPosition,
                analysis.jobCareer,
                ...(analysis.questionCount > 0
                  ? [`면접 질문 ${analysis.questionCount}개`]
                  : [])
              ];
              return (
                <li
                  key={analysis.analysisId}
                  className="flex flex-col gap-4 border-b border-border py-6 md:flex-row md:items-start md:gap-6"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex items-center gap-3">
                      {badge && (
                        <Badge appearance="weak" type={badge.type}>
                          {badge.label}
                        </Badge>
                      )}
                      <h3 className="text-2xl font-semibold text-text-primary">
                        이력서 분석
                      </h3>
                    </div>
                    <p className="flex flex-wrap items-center gap-1.5 text-base text-text-secondary">
                      {meta.map((item, index) => (
                        <React.Fragment key={index}>
                          {index > 0 && (
                            <span
                              aria-hidden
                              className="size-0.5 rounded-full bg-text-secondary"
                            />
                          )}
                          <span>{item}</span>
                        </React.Fragment>
                      ))}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-row items-center justify-between gap-2 md:flex-col md:items-end">
                    {/* total_score는 평가 완료 이후에만 응답에 포함된다 */}
                    {analysis.totalScore !== undefined && (
                      <p className="text-2xl font-bold text-primary">
                        총점 {analysis.totalScore}점
                      </p>
                    )}
                    {hasResult && (
                      <Link
                        href={resumeAnalysisResultPath(analysis.analysisId)}
                        className={buttonVariants({ variant: "secondary" })}
                      >
                        결과 보기
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          {data.totalPages > 1 && (
            <Pagination
              className="self-center"
              currentPage={data.currentPage}
              totalPages={data.totalPages}
              onPageChange={(nextPage) => setRouterPage(router, nextPage)}
            />
          )}
        </>
      )}
    </div>
  );
}
