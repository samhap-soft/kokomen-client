import { CamelCasedProperties, ResumeOutput } from "@kokomen/types";
import { motion } from "motion/react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

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

  const chartData = {
    labels: categories.map((cat) => cat.label),
    datasets: [
      {
        data: categories.map(
          (cat) =>
            (result[cat.key as keyof typeof result] as { score: number })
              .score || 0
        ),
        backgroundColor: categories.map((cat) => cat.color),
        borderColor: categories.map((cat) => cat.color),
        borderWidth: 2
      }
    ]
  };

  const chartOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          font: { size: 14 }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.label}: ${context.parsed}점`;
          }
        }
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

        {/* 차트와 점수 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 도넛 차트 */}
          <div className="bg-bg-container border border-border rounded-lg p-8">
            <div className="h-80 relative">
              <Doughnut data={chartData} options={chartOptions} />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none -translate-y-10">
                <div className="text-center">
                  <div className="text-sm text-text-tertiary">총점</div>
                  <div className="text-4xl font-bold text-primary">
                    {result.totalScore}
                  </div>
                  <div className="text-sm text-text-tertiary">/ 100점</div>
                </div>
              </div>
            </div>
          </div>

          {/* 점수 목록 */}
          <div className="bg-bg-container border border-border rounded-lg p-8">
            <h3 className="text-lg font-semibold text-text-heading mb-6">
              항목별 점수
            </h3>
            <div className="space-y-4">
              {categories.map((cat, index) => {
                const data = result[cat.key as keyof typeof result] as {
                  score: number;
                  reason: string;
                };
                return (
                  <div key={cat.label + index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-sm font-medium text-text-heading">
                          {cat.label}
                        </span>
                      </div>
                      <span
                        className="text-lg font-bold"
                        style={{ color: cat.color }}
                      >
                        {data.score}점
                      </span>
                    </div>
                    <div className="relative h-2 bg-fill-quaternary rounded-full overflow-hidden">
                      <div
                        className="absolute h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${data.score}%`,
                          backgroundColor: cat.color
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 종합 피드백 */}
        <div className="bg-primary-bg border-l-4 border-primary rounded-lg p-6">
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
            상세 평가
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat, index) => {
              const data = result[cat.key as keyof typeof result] as {
                score: number;
                reason: string;
              };
              return (
                <div
                  key={cat.label + index}
                  className="border border-border rounded-lg p-6 space-y-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-text-heading flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.label}
                    </h3>
                    <span
                      className="text-2xl font-bold"
                      style={{ color: cat.color }}
                    >
                      {data.score}점
                    </span>
                  </div>
                  <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                    {data.reason}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
