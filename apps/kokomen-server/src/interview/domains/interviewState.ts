import { registerEnumType } from "@nestjs/graphql";

export enum InterviewState {
  IN_PROGRESS = "IN_PROGRESS",
  FINISHED = "FINISHED"
}

registerEnumType(InterviewState, {
  name: "InterviewState"
});
