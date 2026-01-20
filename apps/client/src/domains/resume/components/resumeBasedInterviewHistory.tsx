import { getResumeBasedInterviewGenerations } from "@/domains/resume/api/resumeBasedInterview";
import { ResumeBasedInterviewGenerationsResponse } from "@kokomen/types";
import { CamelCasedProperties } from "@/utils/convertConvention";
import { resumeBasedInterviewKeys } from "@/utils/querykeys";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import {
  Calendar,
  FileText,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import Link from "next/link";
import PaginationButtons from "@/shared/paginationButtons";
import { formatDate } from "@/utils/date";

export default function ResumeBasedInterviewHistory() {
  const router = useRouter();
  const page = Number(router.query.page) || 0;

  const { data, isLoading, isError } = useQuery<
    CamelCasedProperties<ResumeBasedInterviewGenerationsResponse>
  >({
    queryKey: resumeBasedInterviewKeys.generations(page),
    queryFn: () => getResumeBasedInterviewGenerations(page)
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

  if (isLoading) {
    return (
      <div className="flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-heading mb-2">
            이력서 기반 면접 질문 히스토리
          </h1>
          <p className="text-text-secondary">
            생성된 이력서 기반 면접 질문들을 확인해보세요
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
            이력서 기반 면접 질문 히스토리
          </h1>
          <p className="text-text-secondary">
            생성된 이력서 기반 면접 질문들을 확인해보세요
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

  const generations = data.data || [];

  return (
    <div className="flex-1">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-heading mb-2">
          이력서 기반 면접 질문 히스토리
        </h1>
        <p className="text-text-secondary">
          생성된 이력서 기반 면접 질문들을 확인해보세요
        </p>
      </div>

      {generations.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-border p-12 text-center">
          <FileText className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
          <p className="text-text-secondary text-lg mb-2">
            생성된 이력서 기반 면접 질문이 없습니다
          </p>
          <p className="text-text-tertiary text-sm">
            이력서를 업로드하여 면접 질문을 생성해보세요
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {generations.map((generation) => (
            <div
              key={generation.id}
              className="bg-white rounded-lg shadow-sm border border-border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-text-heading">
                      이력서 기반 면접 질문
                    </h3>
                    {getStateBadge(generation.state)}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatDate(generation.createdAt)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">연차:</span>
                      <span>{generation.jobCareer}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    {generation.resume && (
                      <div className="flex items-center gap-2 text-text-secondary">
                        <FileText className="w-4 h-4" />
                        <span className="font-medium">이력서:</span>
                        <a
                          href={generation.resume.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          {generation.resume.name}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                    {generation.portfolio && (
                      <div className="flex items-center gap-2 text-text-secondary">
                        <FileText className="w-4 h-4" />
                        <span className="font-medium">포트폴리오:</span>
                        <a
                          href={generation.portfolio.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          {generation.portfolio.name}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {generation.state === "COMPLETED" && (
                  <div className="md:ml-4 md:w-auto w-full">
                    <Link
                      href={`/resume/interview/${generation.id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover transition-colors md:w-auto w-full justify-center"
                    >
                      질문 보기
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
