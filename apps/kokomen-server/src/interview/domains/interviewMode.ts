import { registerEnumType } from "@nestjs/graphql";

export enum InterviewMode {
  TEXT,
  VOICE
}
registerEnumType(InterviewMode, {
  name: "InterviewMode"
});
