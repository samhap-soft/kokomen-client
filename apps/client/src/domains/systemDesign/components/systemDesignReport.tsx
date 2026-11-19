import { RankLabel } from "@/domains/interviewReport/components/rankLabel";
import useInterviewCreateMutation from "@/domains/interview/hooks/useInterviewCreateMutation";
import { getSystemDesignReport } from "@/domains/systemDesign/api";
import { getDifficultyLabel } from "@/domains/systemDesign/constants";
import { systemDesignKeys } from "@/utils/querykeys";
import { SystemDesignReport, SystemDesignStage } from "@kokomen/types";
import { Badge, Button, CheckIcon, CloseIcon, Skeleton } from "@kokomen/ui";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import Link from "next/link";
import { JSX } from "react";

// eslint-disable-next-line @rushstack/typedef-var
const DiagramEditor = dynamic(
  () => import("@kokomen/ui/systemDesign").then((module) => module.DiagramEditor),
  { ssr: false }
);

const STAGE_LABELS: Record<Exclude<SystemDesignStage, "REQUIREMENTS">, string> = {
  HIGH_LEVEL: "개략 설계",
  DEEP_DIVE: "심화"
};

const cardClassName: string =
  "flex flex-col gap-4 rounded-[20px] border border-border bg-bg-elevated p-5 md:p-6";

/**
 * 시스템 설계 면접 리포트. 기본 면접 결과 페이지와 같은 카드 · 배지 규칙을 쓴다.
 * 백엔드 작업 전이라 MSW 목이 응답한다(서버 렌더링 없이 브라우저에서 조회).
 */
export function SystemDesignReportView({
  interviewId
}: {
  interviewId: number;
}): JSX.Element {
  const { data, isPending, isError } = useQuery({
    queryKey: systemDesignKeys.reportByInterviewId(interviewId),
    queryFn: () => getSystemDesignReport(interviewId)
  });

  if (isPending) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-1/2 rounded-lg bg-fill-tertiary" />
        <Skeleton className="h-48 w-full rounded-[20px] bg-fill-tertiary" />
        <Skeleton className="h-96 w-full rounded-[20px] bg-fill-tertiary" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-[20px] border border-border p-10 text-center">
        <p className="text-lg font-semibold text-text-primary">리포트를 불러오지 못했어요.</p>
        <p className="text-text-secondary">면접이 아직 끝나지 않았거나, 없는 면접일 수 있어요.</p>
        <Link href="/interviews" className="text-primary-text underline">
          면접 메인으로
        </Link>
      </div>
    );
  }
  return <ReportContent report={data} />;
}

function ReportContent({ report }: { report: SystemDesignReport }): JSX.Element {
  const { createSystemDesignInterviewMutation } = useInterviewCreateMutation({});
  const metCount = report.evaluation_points.filter((point) => point.is_met).length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge appearance="weak" type="brand">
              시스템 설계
            </Badge>
            <Badge appearance="weak" type="neutral">
              {getDifficultyLabel(report.difficulty)}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-text-primary">{report.topic.title}</h1>
          <p className="text-lg text-text-secondary">{report.topic.description}</p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="large"
          disabled={createSystemDesignInterviewMutation.isPending}
          onClick={() =>
            createSystemDesignInterviewMutation.mutate({ difficulty: report.difficulty })
          }
        >
          같은 주제로 다시 하기
        </Button>
      </div>

      <section className={cardClassName} aria-labelledby="sd-summary">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="sd-summary" className="text-xl font-bold text-text-primary">
            종합 평가
          </h2>
          <p className="text-3xl font-bold text-primary">{report.total_score}점</p>
        </div>
        <p className="text-base text-text-primary">{report.total_feedback}</p>
        <p className="rounded-xl bg-bg-layout px-4 py-3 text-sm text-text-secondary">
          {report.difficulty_comment}
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className={cardClassName} aria-labelledby="sd-points">
          <h2 id="sd-points" className="text-xl font-bold text-text-primary">
            평가 포인트 {report.evaluation_points.length}개 중 {metCount}개 충족
          </h2>
          <ul className="flex flex-col gap-3">
            {report.evaluation_points.map((point) => (
              <li key={point.description} className="flex items-start gap-2.5">
                <span
                  className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full ${
                    point.is_met ? "bg-success-bg text-success-text" : "bg-error-bg text-error-text"
                  }`}
                >
                  {point.is_met ? <CheckIcon size={16} /> : <CloseIcon size={16} />}
                </span>
                <span className="text-base text-text-primary">
                  {point.description}
                  <span className="sr-only">{point.is_met ? " (충족)" : " (미충족)"}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className={cardClassName} aria-labelledby="sd-requirements">
          <h2 id="sd-requirements" className="text-xl font-bold text-text-primary">
            놓친 요구사항
          </h2>
          {report.missed_requirements.length === 0 ? (
            <p className="text-text-secondary">숨은 요구사항을 모두 확인했어요.</p>
          ) : (
            <>
              <p className="text-sm text-text-secondary">
                면접관이 정해 둔 조건 중 묻지 않은 것이에요. 다음에는 먼저 확인해 보세요.
              </p>
              <ul className="flex flex-wrap gap-2">
                {report.missed_requirements.map((name) => (
                  <li key={name}>
                    <Badge appearance="weak" type="warning">
                      {name}
                    </Badge>
                  </li>
                ))}
              </ul>
            </>
          )}
          {report.requirement_questions.length > 0 && (
            <div className="flex flex-col gap-2 border-t border-border pt-4">
              <h3 className="text-sm font-semibold text-text-secondary">내가 한 역질문</h3>
              <ul className="flex flex-col gap-2">
                {report.requirement_questions.map((item, index) => (
                  <li key={index} className="flex flex-col gap-0.5 text-sm">
                    <span className="font-medium text-text-primary">Q. {item.question}</span>
                    <span className="text-text-secondary">A. {item.answer}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>

      <section className={cardClassName} aria-labelledby="sd-diagram">
        <h2 id="sd-diagram" className="text-xl font-bold text-text-primary">
          최종 다이어그램
        </h2>
        <div className="flex h-[420px] flex-col md:h-[520px]">
          <DiagramEditor defaultValue={report.final_diagram} readOnly />
        </div>
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="sd-answers">
        <h2 id="sd-answers" className="text-xl font-bold text-text-primary">
          단계별 답변
        </h2>
        <ol className="flex flex-col gap-4">
          {report.feedbacks.map((feedback, index) => (
            <li key={feedback.question_id} className={cardClassName}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text-secondary">
                    질문 {String(index + 1).padStart(2, "0")}
                  </span>
                  <Badge appearance="weak" type="neutral">
                    {STAGE_LABELS[feedback.stage]}
                  </Badge>
                </div>
                <RankLabel rank={feedback.answer_rank} />
              </div>
              <p className="text-lg font-semibold text-text-primary">{feedback.question}</p>
              <p className="whitespace-pre-wrap text-base text-text-primary">{feedback.answer}</p>
              <p className="rounded-xl bg-bg-layout px-4 py-3 text-sm text-text-secondary">
                {feedback.answer_feedback}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
