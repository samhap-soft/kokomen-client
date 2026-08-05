import {
  resumeAnalysisCategories,
  resumeEvaluationCategories
} from "@/domains/resume/constants";
import {
  CamelCasedProperties,
  ResumeAnalysisEvaluation,
  ResumeOutput
} from "@kokomen/types";

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
  resumeAnalysisResult: CamelCasedProperties<
    CamelCasedProperties<ResumeOutput["result"]>
  >
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

export type ResumeAnalysisCategoryData = {
  key: string;
  label: string;
  color: string;
  score: number;
  weight: number;
  evaluation: string;
  reason: string[];
  improvements: string[];
};

/**
 * 이력서 분석 평가 결과를 차트/카드에서 쓰기 좋은 형태로 변환한다.
 * 채용 공고를 제공하지 않으면 jdFit이 없으므로 해당 지표는 제외한다.
 */
export const parseResumeAnalysisCategoryData = (
  evaluation: ResumeAnalysisEvaluation
): ResumeAnalysisCategoryData[] => {
  return resumeAnalysisCategories.flatMap((cat) => {
    const data = evaluation[cat.key];
    if (!data) return [];
    const score = data.score ?? 0;
    return [
      {
        ...cat,
        score,
        weight: data.weight ?? 0,
        evaluation: resumeEvaluation(score),
        reason: data.reason ?? [],
        improvements: data.improvements ?? []
      }
    ];
  });
};
