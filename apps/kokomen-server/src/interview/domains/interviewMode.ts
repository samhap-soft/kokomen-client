import { registerEnumType } from "@nestjs/graphql";

export enum InterviewMode {
  TEXT = "TEXT",
  VOICE = "VOICE"
}

export const INTERVIEW_MODE_TOKEN_COUNT: Record<
  keyof typeof InterviewMode,
  number
> = {
  TEXT: 1,
  VOICE: 2
};

export function getInterviewModeTokenCount(
  interviewMode: InterviewMode
): number {
  return INTERVIEW_MODE_TOKEN_COUNT[interviewMode];
}

registerEnumType(InterviewMode, {
  name: "InterviewMode"
});
