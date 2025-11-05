import {
  resumeEvaluationGradeColors,
  resumeEvaluationGradeLabels,
  resumeEvaluationGradeRanges
} from "@/domains/resume/constants";
import { resumeEvaluation } from "@/domains/resume/utils/resumeEvaluation";
import { ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";

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
          return [
            `점수: ${score}점`,
            `등급: ${resumeEvaluationGradeLabels[evaluation]}`
          ];
        }
      },
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      padding: 12,
      titleFont: { size: 14, weight: "bold" },
      bodyFont: { size: 13 }
    }
  }
};

export const ResumeScoreChart = ({
  categoryData
}: {
  categoryData: {
    key: string;
    label: string;
    color: string;
    score: number;
    evaluation: string;
    reason: string;
  }[];
}) => {
  const chartData = {
    labels: categoryData.map((cat) => cat.label),
    datasets: [
      {
        label: "점수",
        data: categoryData.map((cat) => cat.score),
        backgroundColor: categoryData.map(
          (cat) =>
            resumeEvaluationGradeColors[
              cat.evaluation as keyof typeof resumeEvaluationGradeColors
            ]
        ),
        borderColor: categoryData.map(
          (cat) =>
            resumeEvaluationGradeColors[
              cat.evaluation as keyof typeof resumeEvaluationGradeColors
            ]
        ),
        borderWidth: 2,
        borderRadius: 8
      }
    ]
  };

  return (
    <>
      <div className="h-96 mb-6">
        <Bar data={chartData} options={chartOptions} />
      </div>
      <div className="flex flex-wrap justify-center gap-4 pt-4 border-t border-border">
        {resumeEvaluationGradeRanges.reverse().map((range) => (
          <div key={range.grade} className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded"
              style={{
                backgroundColor:
                  resumeEvaluationGradeColors[
                    resumeEvaluation(
                      range.min
                    ) as keyof typeof resumeEvaluationGradeColors
                  ]
              }}
            />
            <span className="text-sm text-text-secondary">
              {range.grade} ({range.min}-
              {range.max === 100 ? range.max : range.max}점)
            </span>
          </div>
        ))}
      </div>
    </>
  );
};
