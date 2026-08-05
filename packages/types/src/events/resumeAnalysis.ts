interface ResumeAnalysisEventPayloads {
  "resumeAnalysis:submitted": {
    analysis_id: number;
    // 비회원 제출일 때만 존재
    guest_token?: string;
  };
  "resumeAnalysis:completed": { analysis_id: number };
  "resumeAnalysis:error": { error: string };
}

type ResumeAnalysisEventType = keyof ResumeAnalysisEventPayloads;
export type { ResumeAnalysisEventType, ResumeAnalysisEventPayloads };
