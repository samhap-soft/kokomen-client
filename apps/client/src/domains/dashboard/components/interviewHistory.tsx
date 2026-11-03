import { getInterviewHistory } from "@/domains/dashboard/api";
import { formatDotDate } from "@/utils/date";
import { interviewHistoryKeys } from "@/utils/querykeys";
import {
  getRouterPage,
  setRouterPage
} from "@/domains/dashboard/utils/pageQuery";
import {
  Badge,
  buttonVariants,
  ChevronRightIcon,
  Chip,
  Pagination,
  RoundSpinner,
  Select,
  textButtonVariants
} from "@kokomen/ui";
import { InterviewHistory as InterviewHistoryItem } from "@kokomen/types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/router";
import { JSX, useState } from "react";

const PAGE_SIZE: number = 10;

type Range = "ALL" | "FINISHED" | "IN_PROGRESS";
type Sort = "desc" | "asc";

const RANGE_FILTERS: { label: string; value: Range }[] = [
  { label: "전체", value: "ALL" },
  { label: "완료", value: "FINISHED" },
  { label: "진행 중", value: "IN_PROGRESS" }
];

function Divider(): JSX.Element {
  return <span aria-hidden className="h-2.5 w-px shrink-0 bg-gray-5" />;
}

function Dot(): JSX.Element {
  return (
    <span
      aria-hidden
      className="size-0.5 shrink-0 rounded-full bg-text-secondary"
    />
  );
}

function InterviewRow({
  interview
}: {
  interview: InterviewHistoryItem;
}): JSX.Element {
  const isFinished = interview.interview_state === "FINISHED";
  return (
    <li className="flex flex-col gap-4 border-b border-border py-6 md:flex-row md:items-center md:gap-6">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center gap-2">
          {isFinished && (
            <Badge appearance="weak" type="brand">
              완료
            </Badge>
          )}
          <p className="text-sm text-text-secondary">
            {interview.interview_category}
          </p>
        </div>
        <p className="text-lg font-semibold text-text-primary">
          {interview.root_question}
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-secondary">
          <div className="flex items-center gap-1.5">
            <span>{formatDotDate(interview.created_at)}</span>
            <Divider />
            <span>
              {interview.cur_answer_count}/{interview.max_question_count}문제
            </span>
            <Dot />
            <span>
              {isFinished
                ? `점수 변동 ${interview.score > 0 ? "+" : ""}${interview.score}점`
                : "진행 중"}
            </span>
          </div>
          {isFinished && (
            <Link
              href={`/members/interviews/${interview.interview_id}`}
              className={textButtonVariants({
                variant: "secondary",
                size: "small"
              })}
            >
              공개된 기록 보기
              <ChevronRightIcon size={14} />
            </Link>
          )}
        </div>
      </div>
      <Link
        href={
          isFinished
            ? `/interviews/${interview.interview_id}/result`
            : `/interviews/${interview.interview_id}?mode=${interview.interview_mode}`
        }
        className={buttonVariants({
          variant: "secondary",
          className: "shrink-0 self-start md:self-center"
        })}
      >
        {isFinished ? "보고서 보기" : "이어하기"}
      </Link>
    </li>
  );
}

export default function InterviewHistory(): JSX.Element {
  const router = useRouter();
  const page = getRouterPage(router);
  const [sort, setSort] = useState<Sort>("desc");
  const [range, setRange] = useState<Range>("ALL");

  // /interviews/me 는 전체 개수를 주지 않는다. 한 개를 더 받아 다음 페이지가 있는지만 판단한다.
  const { data, isLoading, isError } = useQuery({
    queryKey: interviewHistoryKeys.page([sort, range, page]),
    queryFn: () =>
      getInterviewHistory({ page, size: PAGE_SIZE + 1, sort, range }),
    placeholderData: keepPreviousData
  });

  const interviews = (data ?? []).slice(0, PAGE_SIZE);
  const hasNext = (data?.length ?? 0) > PAGE_SIZE;

  const changeFilter = (next: { sort?: Sort; range?: Range }): void => {
    if (next.sort) setSort(next.sort);
    if (next.range) setRange(next.range);
    setRouterPage(router, 0);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-text-primary">면접 기록</h2>
        <p className="text-sm text-text-secondary">
          이전 면접을 복습하거나 진행 중인 면접을 이어가세요.
        </p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2" role="group" aria-label="면접 상태">
          {RANGE_FILTERS.map((filter) => (
            <Chip
              key={filter.value}
              active={range === filter.value}
              onClick={() => changeFilter({ range: filter.value })}
            >
              {filter.label}
            </Chip>
          ))}
        </div>
        <Select
          className="w-28"
          size="small"
          aria-label="날짜 정렬"
          value={sort}
          options={[
            { value: "desc", label: "최신순" },
            { value: "asc", label: "오래된순" }
          ]}
          onChange={(value) => changeFilter({ sort: value as Sort })}
        />
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <RoundSpinner size="xl" />
        </div>
      )}

      {isError && (
        <p className="py-12 text-center text-error">
          데이터를 불러오는 중 오류가 발생했습니다.
        </p>
      )}

      {!isLoading && !isError && interviews.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-lg font-semibold text-text-primary">
            아직 면접 기록이 없습니다
          </p>
          <p className="text-sm text-text-secondary">
            첫 번째 면접을 시작해보세요!
          </p>
          <Link
            href="/interviews"
            className={buttonVariants({ variant: "primary" })}
          >
            면접 시작하기
          </Link>
        </div>
      )}

      {interviews.length > 0 && (
        <>
          <ul className="flex flex-col">
            {interviews.map((interview) => (
              <InterviewRow
                key={interview.interview_id}
                interview={interview}
              />
            ))}
          </ul>
          {(page > 0 || hasNext) && (
            <Pagination
              className="self-center"
              currentPage={page}
              hasNext={hasNext}
              onPageChange={(nextPage) => setRouterPage(router, nextPage)}
            />
          )}
        </>
      )}
    </div>
  );
}
