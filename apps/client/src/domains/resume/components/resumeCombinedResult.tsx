import { ResumeAnalysis, UserInfo } from "@kokomen/types";
import {
  parseResumeAnalysisCategoryData,
  resumeEvaluation,
  ResumeAnalysisCategoryData
} from "../utils/resumeEvaluation";
import Link from "next/link";
import { resumeEvaluationGradeLabels } from "@/domains/resume/constants";
import React, { useState } from "react";
import { InterviewMode } from "@kokomen/types";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { Badge, Button, buttonVariants, Chip, useToast } from "@kokomen/ui";
import { isAxiosError } from "axios";
import { createResumeAnalysisInterview } from "@/domains/resume/api/resumeAnalysis";
import ResumeInterviewModeSelectModal from "@/domains/resume/components/resumeInterviewModeSelectModal";
import { withApiErrorCapture } from "@/utils/error";
import useExtendedRouter from "@/hooks/useExtendedRouter";

const SCORE_TICKS: readonly number[] = [0, 25, 50, 75, 100];

// 종합 점수 도넛의 지름과 두께(px). Figma 938:1826 기준.
const DONUT_SIZE: number = 264;
const DONUT_STROKE: number = 24;

const formatReportDate = (date: string): string => {
  const d = new Date(date);
  const pad = (n: number): string => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
};

function ScoreDonut({ score }: { score: number }): React.JSX.Element {
  const radius = (DONUT_SIZE - DONUT_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.min(Math.max(score, 0), 100) / 100;
  return (
    <div
      className="relative"
      style={{ width: DONUT_SIZE, height: DONUT_SIZE }}
      role="img"
      aria-label={`종합 점수 ${score}점 / 100점`}
    >
      <svg
        width={DONUT_SIZE}
        height={DONUT_SIZE}
        viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={DONUT_SIZE / 2}
          cy={DONUT_SIZE / 2}
          r={radius}
          fill="none"
          strokeWidth={DONUT_STROKE}
          className="stroke-border"
        />
        <circle
          cx={DONUT_SIZE / 2}
          cy={DONUT_SIZE / 2}
          r={radius}
          fill="none"
          strokeWidth={DONUT_STROKE}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
          className="stroke-primary"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-[72px] leading-[1.5] font-bold text-text-primary">
          {score}
        </p>
        <p className="text-lg text-text-secondary">/ 100점</p>
      </div>
    </div>
  );
}

function ScoreBar({
  category
}: {
  category: ResumeAnalysisCategoryData;
}): React.JSX.Element {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-start justify-between font-bold">
        <p className="text-lg text-text-primary">{category.label}</p>
        <p className="text-xl text-primary">{category.score}</p>
      </div>
      <div
        className="h-[18px] w-full overflow-hidden rounded-full bg-border"
        role="meter"
        aria-label={category.label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={category.score}
      >
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${Math.min(Math.max(category.score, 0), 100)}%` }}
        />
      </div>
    </div>
  );
}

function BulletList({ items }: { items: string[] }): React.JSX.Element {
  if (items.length === 1) {
    return <p className="text-lg text-text-secondary">{items[0]}</p>;
  }
  return (
    <ul className="flex list-disc flex-col gap-1 pl-5 text-lg text-text-secondary">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

export default function ResumeCombinedResult({
  analysis,
  user
}: {
  analysis: ResumeAnalysis;
  user: UserInfo | null;
}): React.JSX.Element | null {
  const { evaluation } = analysis;
  const router = useRouter();
  const extendedRouter = useExtendedRouter();
  const { toast } = useToast();
  // 모드 선택 모달에서 사용할 질문 (null이면 모달 닫힘)
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(
    null
  );

  const questions = analysis.questions ?? [];

  const createInterviewMutation = useMutation({
    mutationFn: ({
      generatedQuestionId,
      mode
    }: {
      generatedQuestionId: number;
      mode: InterviewMode;
    }) =>
      createResumeAnalysisInterview({
        analysisId: analysis.analysisId,
        generatedQuestionId,
        maxQuestionCount: questions.length,
        mode
      }).then((result) => ({ result, mode })),
    onSuccess: ({ result, mode }) => {
      // 응답 형태로 모드를 유추하지 않고 요청한 모드를 그대로 넘긴다
      router.push(`/interviews/${result.interviewId}?mode=${mode}`);
    },
    onError: withApiErrorCapture((error) => {
      if (isAxiosError(error)) {
        if (error.response?.status === 401) {
          extendedRouter.navigateToLogin();
          return;
        }
        const message = (
          error.response?.data as { message?: string } | undefined
        )?.message;
        if (message) {
          toast({
            title: "면접 생성 실패",
            description: message,
            variant: "error"
          });
          return;
        }
      }
      toast({
        title: "면접 생성 실패",
        description:
          "면접 생성 중 오류가 발생했어요. 잠시 후 다시 시도해주세요",
        variant: "error"
      });
    })
  });

  const handleSelectMode = (mode: InterviewMode): void => {
    if (selectedQuestionId === null) return;
    createInterviewMutation.mutate({
      generatedQuestionId: selectedQuestionId,
      mode
    });
  };

  if (!evaluation) return null;

  const categoryData = parseResumeAnalysisCategoryData(evaluation);
  const sortedByScore = [...categoryData].sort((a, b) => b.score - a.score);
  const strongest = sortedByScore[0];
  const weakest = sortedByScore[sortedByScore.length - 1];
  const nickname = user?.nickname ?? "OOO";
  const isCreatingInterview = createInterviewMutation.isPending;
  const listPath = user ? "/dashboard?tab=resume-analyses" : "/resume";

  return (
    <>
      <section className="flex flex-col gap-[50px]">
        {/* 페이지 제목 */}
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-2">
            <div className="flex flex-1 flex-col gap-2">
              <p className="text-sm font-bold text-primary">
                RESUME ANALYSIS REPORT
              </p>
              <h1 className="text-3xl leading-[1.5] font-bold text-text-primary md:text-[40px]">
                이력서 상세 분석 리포트
              </h1>
              <p className="text-lg text-text-secondary">
                {nickname}님의 이력서 역량과 개선 방향을 한눈에 확인하세요.
              </p>
            </div>
            <Link
              href={listPath}
              className={buttonVariants({ variant: "secondary" })}
            >
              목록으로
            </Link>
          </div>
          <ul className="flex flex-wrap gap-2" aria-label="지원 정보">
            {[
              analysis.jobPosition,
              analysis.jobCareer,
              formatReportDate(analysis.createdAt)
            ].map((label) => (
              <li key={label}>
                <Chip
                  size="large"
                  className="pointer-events-none"
                  tabIndex={-1}
                >
                  {label}
                </Chip>
              </li>
            ))}
          </ul>
        </div>

        {/* 01 역량 진단 */}
        <section className="flex flex-col gap-7 border-b border-border pb-7">
          <h2 className="text-2xl font-bold text-text-primary">
            01&nbsp;&nbsp;역량 진단
          </h2>
          <div className="flex flex-col gap-10 lg:flex-row">
            <div className="flex flex-col items-center gap-6 lg:w-[340px] lg:shrink-0">
              <div className="flex flex-col items-center gap-1">
                <h3 className="text-lg font-bold text-text-primary">
                  종합 점수
                </h3>
                <Badge appearance="weak" type="brand">
                  {
                    resumeEvaluationGradeLabels[
                      resumeEvaluation(evaluation.totalScore)
                    ]
                  }
                </Badge>
              </div>
              <ScoreDonut score={evaluation.totalScore} />
            </div>
            <div className="flex flex-1 flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-text-primary">
                  영역별 역량 분포
                </h3>
                <p className="text-sm text-text-secondary">
                  평가 기준&nbsp;&nbsp;100점 만점
                </p>
              </div>
              {categoryData.map((category) => (
                <ScoreBar key={category.key} category={category} />
              ))}
              <div
                className="flex justify-between text-xs text-text-secondary"
                aria-hidden
              >
                {SCORE_TICKS.map((tick) => (
                  <span key={tick}>{tick}</span>
                ))}
              </div>
            </div>
          </div>
          <dl className="grid grid-cols-1 gap-8 pt-5 md:grid-cols-3">
            {[
              {
                title: "상대적 강점",
                category: strongest,
                summary: strongest.reason[0]
              },
              {
                title: "우선 개선",
                category: weakest,
                summary: weakest.improvements[0]
              }
            ].map(({ title, category, summary }) => (
              <div key={title} className="flex flex-col gap-1.5">
                <dt className="text-sm font-bold text-primary">{title}</dt>
                <dd className="text-xl font-bold text-text-primary">
                  {category.label} · {category.score}점
                </dd>
                {summary && (
                  <dd className="line-clamp-2 text-base text-text-secondary">
                    {summary}
                  </dd>
                )}
              </div>
            ))}
          </dl>
        </section>

        {/* 02 종합 진단 */}
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-text-primary">
            02&nbsp;&nbsp;종합 진단
          </h2>
          <p className="text-lg whitespace-pre-line text-text-secondary">
            {evaluation.totalFeedback}
          </p>
        </section>

        {/* 03 영역별 상세 분석 */}
        <section className="flex flex-col">
          <h2 className="text-2xl font-bold text-text-primary">
            03&nbsp;&nbsp;영역별 상세 분석
          </h2>
          {categoryData.map((category) => (
            <article
              key={category.key}
              className="flex flex-col gap-5 border-b border-border py-8"
            >
              <h3 className="flex items-center gap-3 text-2xl">
                <span className="font-semibold text-text-primary">
                  {category.label}
                </span>
                <span className="font-bold text-primary">
                  {category.score}점
                </span>
              </h3>
              <div className="flex flex-col gap-6 md:flex-row md:gap-10">
                <div className="flex flex-1 flex-col gap-2.5">
                  <h4 className="text-base font-semibold text-text-primary">
                    강점
                  </h4>
                  <BulletList items={category.reason} />
                </div>
                <div className="flex flex-1 flex-col gap-2.5">
                  <h4 className="text-base font-semibold text-primary">
                    이렇게 보완해 보세요
                  </h4>
                  <BulletList items={category.improvements} />
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* 04 이력서 기반 예상 면접 질문 */}
        {questions.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-text-primary">
              04&nbsp;&nbsp;이력서 기반 예상 면접 질문
            </h2>
            <p className="text-sm text-text-secondary">
              총 {questions.length}개 · 질문을 골라 연습하세요.
            </p>
            <ol className="flex flex-col">
              {questions.map((question, index) => (
                <li
                  key={question.generatedQuestionId}
                  className="flex flex-col gap-3 border-b border-border px-4 py-5 sm:flex-row sm:items-center md:px-6"
                >
                  <div className="flex flex-1 items-center gap-3">
                    <span className="shrink-0 text-base font-semibold text-text-primary">
                      질문 {index + 1}
                    </span>
                    <span
                      aria-hidden
                      className="h-2.5 w-px shrink-0 bg-fill-secondary"
                    />
                    <p className="flex-1 text-base font-medium text-text-primary">
                      {question.question}
                    </p>
                  </div>
                  {analysis.interviewAvailable && (
                    <Button
                      variant="secondary"
                      className="shrink-0"
                      onClick={() =>
                        setSelectedQuestionId(question.generatedQuestionId)
                      }
                      disabled={isCreatingInterview}
                    >
                      면접 시작하기
                    </Button>
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}
      </section>

      <ResumeInterviewModeSelectModal
        isOpen={selectedQuestionId !== null}
        onClose={() => setSelectedQuestionId(null)}
        onSelectMode={handleSelectMode}
      />
    </>
  );
}
