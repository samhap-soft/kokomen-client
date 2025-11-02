import { CamelCasedProperties, ResumeOutput } from "@kokomen/types";
import { motion } from "motion/react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";
import { parseResumeEvaluationCategoryData } from "../utils/resumeEvaluation";
import Image from "next/image";
import Link from "next/link";
import { ResumeScoreChart } from "@/domains/resume/components/resumeScoreChart";
import { resumeEvaluationGradeColors } from "@/domains/resume/constants";
import { Check } from "lucide-react";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function ResumeEvaluationResult({
  result
}: {
  result: CamelCasedProperties<ResumeOutput>;
}) {
  const categoryData = parseResumeEvaluationCategoryData(result);

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-5xl mx-auto py-8"
    >
      <div className="space-y-8">
        {/* 헤더 */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-text-heading">
            이력서 평가 결과
          </h1>
          <p className="text-lg text-text-secondary">
            총점:{" "}
            <span className="text-2xl font-bold text-primary">
              {result.totalScore}
            </span>
            점
          </p>
        </div>
        <div className="bg-warning-bg p-4 rounded-lg flex items-center gap-4">
          <Image
            src="/kokomenReport.png"
            alt="warning"
            width={40}
            height={40}
          />
          <div>
            <p className="text-primary text-sm">
              결과는 꼬꼬면의 환산 시스템을 이용하여 환산한 결과이며, 실제
              기업의 평가와 다를 수 있습니다.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 ">
          <p className="text-text-secondary text-lg">
            꼬꼬면과 함께 취업 준비를 시작해보세요!
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Link
              href="/interviews"
              className="bg-primary text-white px-4 py-2 rounded-md font-bold"
            >
              면접 대비하러 가기
            </Link>
            <Link
              href="/resume/eval"
              className="bg-primary-light text-primary px-4 py-2 rounded-md font-bold"
            >
              내 이력서 분석하기
            </Link>
          </div>
        </div>

        {/* 차트 */}
        <div className="bg-bg-container border border-border rounded-lg p-8">
          <h3 className="text-lg font-semibold text-text-heading mb-6">
            항목별 평가 차트
          </h3>
          <ResumeScoreChart categoryData={categoryData} />
        </div>

        {/* 항목별 평가 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryData.map((cat, index) => (
            <div
              key={cat.label + index}
              className="bg-bg-container border border-border rounded-lg p-6 space-y-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-text-heading">
                  {cat.label}
                </h3>
                <span
                  className="text-2xl font-bold"
                  style={{
                    color:
                      resumeEvaluationGradeColors[
                        cat.evaluation as keyof typeof resumeEvaluationGradeColors
                      ]
                  }}
                >
                  {cat.score}점
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium text-white"
                  style={{
                    backgroundColor:
                      resumeEvaluationGradeColors[
                        cat.evaluation as keyof typeof resumeEvaluationGradeColors
                      ]
                  }}
                >
                  {cat.evaluation}
                </span>
              </div>
              <div className="relative h-2 bg-fill-quaternary rounded-full overflow-hidden">
                <div
                  className="absolute h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${cat.score}%`,
                    backgroundColor:
                      resumeEvaluationGradeColors[
                        cat.evaluation as keyof typeof resumeEvaluationGradeColors
                      ]
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* 종합 피드백 */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <Image
            src="/kokobot/fixReport.svg"
            alt="warning"
            width={20}
            height={30}
            className="w-60 h-auto object-contain hidden md:block"
          />
          <div className="relative bg-primary-bg-light rounded-lg p-6">
            <div className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 hidden md:block">
              <div className="w-0 h-0 border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent border-r-[20px] border-r-primary-bg-light"></div>
            </div>
            <h2 className="text-xl font-semibold text-text-heading mb-3">
              종합 피드백
            </h2>
            <p className="text-text-secondary whitespace-pre-line leading-relaxed">
              {result.totalFeedback}
            </p>
          </div>
        </div>

        {/* 상세 평가 */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-text-heading">
            상세 평가 및 피드백
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {categoryData.map((cat, index) => (
              <div
                key={cat.label + index}
                className="border border-border rounded-lg p-6 space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-1 h-12 rounded-full"
                      style={{
                        backgroundColor:
                          resumeEvaluationGradeColors[
                            cat.evaluation as keyof typeof resumeEvaluationGradeColors
                          ]
                      }}
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-text-heading">
                        {cat.label}
                      </h3>
                      <span
                        className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium text-white"
                        style={{
                          backgroundColor:
                            resumeEvaluationGradeColors[
                              cat.evaluation as keyof typeof resumeEvaluationGradeColors
                            ]
                        }}
                      >
                        {cat.evaluation}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-text-tertiary">점수</div>
                    <div
                      className="text-3xl font-bold"
                      style={{
                        color:
                          resumeEvaluationGradeColors[
                            cat.evaluation as keyof typeof resumeEvaluationGradeColors
                          ]
                      }}
                    >
                      {cat.score}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-line border-t border-border pt-4">
                  {cat.reason}
                </div>
                <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-line border-t border-border pt-4">
                  <h3 className="text-lg font-semibold text-text-heading flex items-center">
                    <Check className="w-5 h-5 text-primary mr-2" />
                    이렇게 보완해보세요!
                  </h3>
                  <p className="text-text-secondary leading-relaxed whitespace-pre-line">
                    {cat.improvements}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
