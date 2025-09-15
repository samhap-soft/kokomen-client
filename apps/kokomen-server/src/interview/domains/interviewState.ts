import { registerEnumType } from "@nestjs/graphql";

export enum InterviewState {
  IN_PROGRESS,
  FINISHED
}
registerEnumType(InterviewState, {
  name: "InterviewState"
});
