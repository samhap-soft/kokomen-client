interface ResumeBasedInterviewEventPayloads {
  "resumeBasedInterview:submitted": {
    resume_based_interview_result_id: number;
  };
  "resumeBasedInterview:created": undefined;
  "resumeBasedInterview:updated": undefined;
  "resumeBasedInterview:error": { error: string };
}

type ResumeBasedInterviewEventType = keyof ResumeBasedInterviewEventPayloads;
export type {
  ResumeBasedInterviewEventType,
  ResumeBasedInterviewEventPayloads
};
