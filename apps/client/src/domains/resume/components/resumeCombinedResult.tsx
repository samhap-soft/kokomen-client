import { ResumeAnalysis, UserInfo } from "@kokomen/types";
import { motion } from "motion/react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";
import { parseResumeAnalysisCategoryData } from "../utils/resumeEvaluation";
import Link from "next/link";
import Image from "next/image";
import { ResumeScoreChart } from "@/domains/resume/components/resumeScoreChart";
import { resumeEvaluationGradeColors } from "@/domains/resume/constants";
import { Check, MessageSquare, Sparkles } from "lucide-react";
import React, { useState } from "react";
import { InterviewMode } from "@kokomen/types";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useToast } from "@kokomen/ui";
import { isAxiosError } from "axios";
import { createResumeAnalysisInterview } from "@/domains/resume/api/resumeAnalysis";
import ResumeInterviewModeSelectModal from "@/domains/resume/components/resumeInterviewModeSelectModal";
import { withApiErrorCapture } from "@/utils/error";
import useExtendedRouter from "@/hooks/useExtendedRouter";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// 기술 역량 카테고리 키 (모의면접 준비하기 버튼 노출 대상)
const TECHNICAL_SKILLS_KEY: string = "technicalSkills";

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
  const nickname = user?.nickname ?? "OOO";
  const isCreatingInterview = createInterviewMutation.isPending;

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl mx-auto py-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-text-heading mb-6">
          {nickname}님 이력서 상세 분석 리포트
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* 왼쪽 컬럼: 종합점수 + 각 역량별 차트 */}
          <div className="flex flex-col gap-6">
            {/* 종합점수 */}
            <div className="bg-bg-container border border-border rounded-lg p-8 flex flex-col items-center justify-center gap-2">
              <h2 className="text-lg font-semibold text-text-heading">
                종합점수
              </h2>
              <p className="text-5xl font-bold text-primary">
                {evaluation.totalScore}
                <span className="text-2xl text-text-secondary ml-1">점</span>
              </p>
              <div className="bg-warning-bg p-3 rounded-lg flex items-center gap-3 mt-2">
                <Image
                  src="/kokomenReport.png"
                  alt="안내"
                  width={32}
                  height={32}
                  className="flex-shrink-0"
                />
                <p className="text-primary text-xs">
                  결과는 꼬꼬면의 환산 시스템을 이용하여 환산한 결과이며, 실제
                  기업의 평가와 다를 수 있습니다.
                </p>
              </div>
            </div>

            {/* 각 역량별 차트 */}
            <div className="bg-bg-container border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-text-heading mb-6">
                각 역량별 차트
              </h3>
              <ResumeScoreChart categoryData={categoryData} />
            </div>

            {/* 이력서 기반 기술 질문 */}
            {questions.length > 0 && (
              <div className="bg-bg-container border border-border rounded-lg p-6">
                <h2 className="text-lg font-semibold text-text-heading mb-4">
                  이력서 기반 기술 질문
                </h2>
                <div className="flex flex-col gap-3">
                  {questions.map((question, index) => (
                    <div
                      key={question.generatedQuestionId}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 border border-border rounded-lg p-4"
                    >
                      <div className="flex flex-col gap-1 flex-1">
                        <div className="flex items-start gap-2">
                          <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-semibold">
                            {index + 1}
                          </span>
                          <p className="text-sm text-text-primary">
                            {question.question}
                          </p>
                        </div>
                        {question.reason && (
                          <p className="text-xs text-text-secondary pl-8">
                            {question.reason}
                          </p>
                        )}
                      </div>
                      {analysis.interviewAvailable && (
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedQuestionId(question.generatedQuestionId)
                          }
                          disabled={isCreatingInterview}
                          className="flex-shrink-0 inline-flex items-center justify-center gap-1 border border-border text-sm font-medium text-text-primary px-3 py-2 rounded-md hover:bg-fill-secondary transition-colors sm:w-auto w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <MessageSquare className="w-4 h-4" />
                          면접보러 가기
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 오른쪽 컬럼: 종합 피드백 + 역량 표 */}
          <div className="flex flex-col gap-6">
            {/* 종합 피드백 */}
            <div className="bg-primary-bg-light rounded-lg p-6">
              <h2 className="text-lg font-semibold text-text-heading mb-3">
                종합 피드백
              </h2>
              <p className="text-text-secondary whitespace-pre-line leading-relaxed text-sm">
                {evaluation.totalFeedback}
              </p>
            </div>

            {/* 역량 / 강점 / 개선팁 */}
            <div className="bg-bg-container border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-text-heading mb-4">
                역량별 강점 및 개선팁
              </h2>
              <div className="flex flex-col gap-4">
                {categoryData.map((cat) => {
                  const gradeColor =
                    resumeEvaluationGradeColors[
                      cat.evaluation as keyof typeof resumeEvaluationGradeColors
                    ];
                  const isTechnicalSkills = cat.key === TECHNICAL_SKILLS_KEY;
                  return (
                    <div
                      key={cat.key}
                      className="border border-border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-1 h-6 rounded-full"
                            style={{ backgroundColor: gradeColor }}
                          />
                          <h3 className="text-base font-semibold text-text-heading">
                            {cat.label}
                          </h3>
                        </div>
                        <span
                          className="text-lg font-bold"
                          style={{ color: gradeColor }}
                        >
                          {cat.score}점
                        </span>
                      </div>

                      {/* 강점 */}
                      <div className="text-sm text-text-secondary leading-relaxed border-t border-border pt-3">
                        <h4 className="text-sm font-semibold text-text-heading mb-1">
                          강점
                        </h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {cat.reason.map((reason, reasonIndex) => (
                            <li key={reasonIndex}>{reason}</li>
                          ))}
                        </ul>
                      </div>

                      {/* 개선팁 */}
                      <div className="text-sm text-text-secondary leading-relaxed border-t border-border pt-3">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-semibold text-text-heading flex items-center">
                            <Check className="w-4 h-4 text-primary mr-1" />
                            이렇게 보완해보세요!
                          </h4>
                          {isTechnicalSkills && (
                            <Link
                              href="/interviews"
                              className="flex-shrink-0 inline-flex items-center gap-1 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-md hover:bg-primary-hover transition-colors"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              모의면접 준비하기
                            </Link>
                          )}
                        </div>
                        <ul className="list-disc pl-5 space-y-1 mt-1">
                          {cat.improvements.map(
                            (improvement, improvementIndex) => (
                              <li key={improvementIndex}>{improvement}</li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <ResumeInterviewModeSelectModal
        isOpen={selectedQuestionId !== null}
        onClose={() => setSelectedQuestionId(null)}
        onSelectMode={handleSelectMode}
      />
    </>
  );
}
