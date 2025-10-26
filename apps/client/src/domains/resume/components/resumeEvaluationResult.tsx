import { CamelCasedProperties, ResumeOutput } from "@kokomen/types";
import { motion } from "motion/react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ChartOptions
} from "chart.js";
import { resumeEvaluation } from "../utils/resumeEvaluation";
import Image from "next/image";
import Link from "next/link";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function ResumeEvaluationResult({
  result
}: {
  result: CamelCasedProperties<ResumeOutput>;
}) {
  const categories = [
    { key: "technicalSkills", label: "기술 역량", color: "#1677ff" },
    { key: "projectExperience", label: "프로젝트 경험", color: "#52c41a" },
    { key: "problemSolving", label: "문제 해결", color: "#faad14" },
    { key: "careerGrowth", label: "성장 가능성", color: "#eb2f96" },
    { key: "documentation", label: "문서화 능력", color: "#722ed1" }
  ];

  // 등급별 색상 및 범위
  const gradeColors = {
    Excellent: "#52c41a",
    Good: "#1677ff",
    Average: "#faad14",
    Poor: "#ff7875",
    "Very Poor": "#ff4d4f"
  };

  const gradeRanges = [
    { grade: "Very Poor", min: 0, max: 20 },
    { grade: "Poor", min: 20, max: 40 },
    { grade: "Average", min: 40, max: 60 },
    { grade: "Good", min: 60, max: 80 },
    { grade: "Excellent", min: 80, max: 100 }
  ];

  // 각 항목의 점수와 등급 계산
  const categoryData = categories.map((cat) => {
    const data = result[cat.key as keyof typeof result] as {
      score: number;
      reason: string;
    };
    const score = data.score || 0;
    const evaluation = resumeEvaluation(score);
    return {
      ...cat,
      score,
      evaluation,
      reason: data.reason
    };
  });

  const chartData = {
    labels: categoryData.map((cat) => cat.label),
    datasets: [
      {
        label: "점수",
        data: categoryData.map((cat) => cat.score),
        backgroundColor: categoryData.map(
          (cat) => gradeColors[cat.evaluation as keyof typeof gradeColors]
        ),
        borderColor: categoryData.map(
          (cat) => gradeColors[cat.evaluation as keyof typeof gradeColors]
        ),
        borderWidth: 2,
        borderRadius: 8
      }
    ]
  };

  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "x",
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
          callback: function (value) {
            const numValue = Number(value);
            if (numValue === 0) return "매우 부적합 (0)";
            if (numValue === 20) return "부적합 (20)";
            if (numValue === 40) return "보통 (40)";
            if (numValue === 60) return "양호 (60)";
            if (numValue === 80) return "우수 (80)";
            if (numValue === 100) return "매우 우수 (100)";
            return value;
          },
          font: { size: 11 },
          color: "#8c8c8c"
        },
        grid: {
          color: "rgba(0, 0, 0, 0.06)"
        }
      },
      x: {
        ticks: {
          font: { size: 12 },
          color: "#262626"
        },
        grid: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const score = context.parsed.y;
            const evaluation = resumeEvaluation(score);
            return [`점수: ${score}점`, `등급: ${evaluation}`];
          }
        },
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: { size: 14, weight: "bold" },
        bodyFont: { size: 13 }
      }
    }
  };

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
              시험적으로 운영하는 서비스입니다.
            </p>
            <p className="text-primary text-sm">
              평가 결과는 참고용으로만 사용해주세요.
            </p>
          </div>
        </div>

        {/* 차트 */}
        <div className="bg-bg-container border border-border rounded-lg p-8">
          <h3 className="text-lg font-semibold text-text-heading mb-6">
            항목별 평가 차트
          </h3>
          <div className="h-96 mb-6">
            <Bar data={chartData} options={chartOptions} />
          </div>

          {/* 등급 범례 */}
          <div className="flex flex-wrap justify-center gap-4 pt-4 border-t border-border">
            {gradeRanges.reverse().map((range) => (
              <div key={range.grade} className="flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded"
                  style={{
                    backgroundColor:
                      gradeColors[range.grade as keyof typeof gradeColors]
                  }}
                />
                <span className="text-sm text-text-secondary">
                  {range.grade} ({range.min}-
                  {range.max === 100 ? range.max : range.max}점)
                </span>
              </div>
            ))}
          </div>
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
                      gradeColors[cat.evaluation as keyof typeof gradeColors]
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
                      gradeColors[cat.evaluation as keyof typeof gradeColors]
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
                      gradeColors[cat.evaluation as keyof typeof gradeColors]
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* 종합 피드백 */}
        <div className="bg-primary-bg-light border-l-4 border-primary rounded-lg p-6">
          <h2 className="text-xl font-semibold text-text-heading mb-3">
            종합 피드백
          </h2>
          <p className="text-text-secondary whitespace-pre-line leading-relaxed">
            {result.totalFeedback}
          </p>
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
                          gradeColors[
                            cat.evaluation as keyof typeof gradeColors
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
                            gradeColors[
                              cat.evaluation as keyof typeof gradeColors
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
                          gradeColors[
                            cat.evaluation as keyof typeof gradeColors
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
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-4">
          <p className="text-text-secondary text-lg">
            꼬꼬면과 함께 취업 준비를 시작해보세요!
          </p>
          <Link
            href="/interviews"
            className="bg-primary text-white px-4 py-2 rounded-md font-bold"
          >
            면접 대비하러 가기
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
