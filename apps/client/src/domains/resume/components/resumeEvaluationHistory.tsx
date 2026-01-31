import { getResumeEvaluations } from "@/domains/resume/api";
import { ResumeEvaluationsResponse } from "@kokomen/types";
import { CamelCasedProperties } from "@/utils/convertConvention";
import { resumeEvaluationKeys } from "@/utils/querykeys";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import {
  Calendar,
  Briefcase,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import Link from "next/link";
import PaginationButtons from "@/shared/paginationButtons";
import { formatDate } from "@/utils/date";

export default function ResumeEvaluationHistory() {
  const router = useRouter();
  const page = Number(router.query.page) || 0;
  const size = 20;

  const { data, isLoading, isError } = useQuery<
    CamelCasedProperties<ResumeEvaluationsResponse>
  >({
    queryKey: resumeEvaluationKeys.history(page, size),
    queryFn: () => getResumeEvaluations(page, size)
  });

  const getStateBadge = (state: string) => {
    switch (state) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" />
            완료
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3" />
            진행중
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" />
            실패
          </span>
        );
      default:
        return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (isLoading) {
    return (
      <div className="flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-heading mb-2">
            이력서 평가 히스토리
          </h1>
          <p className="text-text-secondary">
            이력서 평가 결과를 확인해보세요
          </p>
        </div>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-heading mb-2">
            이력서 평가 히스토리
          </h1>
          <p className="text-text-secondary">
            이력서 평가 결과를 확인해보세요
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-border p-6 text-center">
          <p className="text-text-secondary">
            데이터를 불러오는 중 오류가 발생했습니다.
          </p>
        </div>
      </div>
    );
  }

  const evaluations = data.evaluations || [];

  return (
    <div className="flex-1">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-heading mb-2">
          이력서 평가 히스토리
        </h1>
        <p className="text-text-secondary">
          이력서 평가 결과를 확인해보세요
        </p>
      </div>

      {evaluations.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-border p-12 text-center">
          <Briefcase className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
          <p className="text-text-secondary text-lg mb-2">
            평가한 이력서가 없습니다
          </p>
          <p className="text-text-tertiary text-sm">
            이력서를 업로드하여 평가를 받아보세요
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {evaluations.map((evaluation) => (
            <div
              key={evaluation.id}
              className="bg-white rounded-lg shadow-sm border border-border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-text-heading">
                      이력서 평가
                    </h3>
                    {getStateBadge(evaluation.state)}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatDate(evaluation.createdAt)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      <span className="font-medium">직무:</span>
                      <span>{evaluation.jobPosition}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">연차:</span>
                      <span>{evaluation.jobCareer}</span>
                    </div>
                  </div>

                  {evaluation.state === "COMPLETED" && (
                    <div className="flex items-center gap-2">
                      <TrendingUp
                        className={`w-4 h-4 ${getScoreColor(evaluation.totalScore)}`}
                      />
                      <span
                        className={`text-lg font-bold ${getScoreColor(evaluation.totalScore)}`}
                      >
                        총점: {evaluation.totalScore}점
                      </span>
                    </div>
                  )}
                </div>

                {evaluation.state === "COMPLETED" && (
                  <div className="md:ml-4 md:w-auto w-full">
                    <Link
                      href={`/resume/eval/${evaluation.id}/result`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover transition-colors md:w-auto w-full justify-center"
                    >
                      결과 보기
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}

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

