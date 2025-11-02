import { resumeEvaluationCategories } from "@/domains/resume/constants";
import { CamelCasedProperties, ResumeOutput } from "@kokomen/types";

export const resumeEvaluation = (score: number) => {
  if (score >= 80) {
    return "Excellent";
  } else if (score >= 60) {
    return "Good";
  } else if (score >= 40) {
    return "Average";
  } else if (score >= 20) {
    return "Poor";
  } else {
    return "Very Poor";
  }
};

export const parseResumeEvaluationCategoryData = (
  resumeAnalysisResult: CamelCasedProperties<ResumeOutput>
): {
  key: string;
  label: string;
  color: string;
  score: number;
  evaluation: string;
  reason: string;
  improvements: string;
}[] => {
  return resumeEvaluationCategories.map((cat) => {
    const data = resumeAnalysisResult[
      cat.key as keyof typeof resumeAnalysisResult
    ] as {
      score: number;
      reason: string;
      improvements: string;
    };
    const score = data.score || 0;
    const evaluation = resumeEvaluation(score);
    return {
      ...cat,
      score,
      evaluation,
      reason: data.reason,
      improvements: data.improvements
    };
  });
};
