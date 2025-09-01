import { Select } from "@kokomen/ui";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  TrendingUp,
  Trophy
} from "lucide-react";
import Link from "next/link";
import { JSX } from "react";
import { Button } from "@kokomen/ui";
import { MemberInterview } from "@kokomen/types";
import { CamelCasedProperties } from "@/utils/convertConvention";
import { useRouter } from "next/router";
import { formatDate } from "@/utils/date";
import { useScreenSize } from "@/hooks/useScreenSize";
import { getVisiblePageNumbers } from "@/utils/pagination";
import { captureButtonEvent } from "@/utils/analytics";

export default function InterviewHistory({
  memberId,
  interviewSummaries,
  sort,
  page,
  totalPageCount
}: {
  memberId: number;
  interviewSummaries: CamelCasedProperties<MemberInterview>["interviewSummaries"];
  sort: "desc" | "asc";
  page: number;
  totalPageCount: number;
}): JSX.Element {
  const router = useRouter();
  const { isMobile } = useScreenSize();

  const maxVisibleButtons = isMobile ? 3 : 5;
  const visiblePageNumbers = getVisiblePageNumbers(
    page,
    totalPageCount,
    maxVisibleButtons
  );

  return (
    <>
      <div className="flex gap-2 mb-4">
        <Select
          className="md:w-44 w-32"
          placeholder="날짜 정렬"
          value={sort}
          options={[
            { value: "desc", label: "최신순", disabled: false },
            { value: "asc", label: "오래된순", disabled: false }
          ]}
          onChange={(value) => {
            router.push(`/members/${memberId}?sort=${value}&page=0`);
          }}
        />
      </div>

      {!interviewSummaries.length && <InterviewHistoryEmpty />}

      {(interviewSummaries.length ?? 0) > 0 && (
        <div>
          <div className="space-y-4">
            {interviewSummaries.map((interview) => (
              <div
                key={interview.interviewId}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between md:flex-row md:w-auto w-full flex-col gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {interview.interviewCategory}
                      </h3>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {interview.rootQuestion}
                    </p>

                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(interview.createdAt)}
                      </div>
                      <div
                        className={`flex items-center gap-1 ${interview.score === 0 ? "text-volcano-6" : "text-green-6"}`}
                      >
                        <TrendingUp className="w-4 h-4" />
                        {interview.score}점
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-500 mt-2">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {interview.interviewViewCount}
                      </div>
                      <div
                        className={`flex items-center gap-1 ${
                          interview.interviewAlreadyLiked && "text-volcano-6"
                        }`}
                      >
                        <Heart className="w-4 h-4" />
                        {interview.interviewLikeCount}
                      </div>
                    </div>
                  </div>

                  <div className="md:ml-4 md:w-auto w-full">
                    <Link
                      onClick={() => {
                        captureButtonEvent({
                          name: "MembersInterveiw",
                          properties: {
                            interviewId: interview.interviewId,
                            category: interview.interviewCategory,
                            question: interview.rootQuestion
                          }
                        });
                      }}
                      href={`/members/interviews/${interview.interviewId}`}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors md:w-auto w-full justify-center"
                    >
                      인터뷰 조회하기
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            {/* 모바일: 3개, PC: 5개 버튼 표시 */}
            <div className="flex justify-center gap-2">
              <Button
                type="button"
                role="button"
                name="prev page"
                aria-label="prev page"
                onClick={() => {
                  router.push(
                    `/members/${memberId}?sort=${sort}&page=${page === 0 ? 0 : page - 1}`
                  );
                }}
                disabled={page === 0}
              >
                <ChevronLeft />
              </Button>

              {visiblePageNumbers.map((pageNumber) => (
                <Button
                  key={pageNumber}
                  type="button"
                  role="button"
                  name={`${pageNumber + 1} page`}
                  aria-label="page"
                  variant={page === pageNumber ? "primary" : "glass"}
                  className={`${page === pageNumber && "disabled:opacity-100 disabled:bg-primary-bg-hover disabled:text-primary"}`}
                  onClick={() => {
                    router.push(
                      `/members/${memberId}?sort=${sort}&page=${pageNumber}`
                    );
                  }}
                  disabled={page === pageNumber}
                >
                  {pageNumber + 1}
                </Button>
              ))}

              <Button
                type="button"
                role="button"
                name="next page"
                aria-label="next page"
                disabled={page === totalPageCount - 1}
                onClick={() => {
                  router.push(
                    `/members/${memberId}?sort=${sort}&page=${page + 1}`
                  );
                }}
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// function InterviewHistorySkeleton(): JSX.Element {
//   return (
//     <div className="space-y-4">
//       {Array.from({ length: 10 }).map((_, index) => (
//         <div
//           key={index}
//           className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
//         >
//           <div className="flex items-start justify-between md:flex-row md:w-auto w-full flex-col gap-4">
//             <div className="flex-1">
//               <div className="flex items-center gap-3 mb-3">
//                 <div className="h-7 bg-gray-200 rounded-md w-32"></div>
//                 <div className="h-6 bg-gray-200 rounded-full w-12"></div>
//               </div>

//               <div className="space-y-2 mb-4">
//                 <div className="h-4 bg-gray-200 rounded w-full"></div>
//                 <div className="h-4 bg-gray-200 rounded w-4/5"></div>
//               </div>

//               <div className="flex items-center gap-6 text-sm">
//                 <div className="flex items-center gap-1">
//                   <div className="w-4 h-4 bg-gray-200 rounded"></div>
//                   <div className="h-4 bg-gray-200 rounded w-20"></div>
//                 </div>
//                 <div className="flex items-center gap-1">
//                   <div className="w-4 h-4 bg-gray-200 rounded"></div>
//                   <div className="h-4 bg-gray-200 rounded w-10"></div>
//                 </div>
//               </div>
//             </div>

//             <div className="md:ml-4 md:w-auto w-full">
//               <div className="h-9 bg-gray-200 rounded-md md:w-20 w-full"></div>
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

function InterviewHistoryEmpty(): JSX.Element {
  return (
    <div className="text-center py-12">
      <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-text-label mb-2">
        해당 유저의 면접 기록이 없습니다
      </h3>
    </div>
  );
}

// function InterviewHistoryError(): JSX.Element {
//   return (
//     <div className="text-center py-12">
//       <Frown className="mx-auto h-12 w-12 text-volcano-5 mb-4" />
//       <p className="text-red-600">데이터를 불러오는 중 오류가 발생했습니다.</p>
//     </div>
//   );
// }
