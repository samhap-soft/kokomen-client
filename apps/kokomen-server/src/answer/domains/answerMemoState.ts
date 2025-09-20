import { registerEnumType } from "@nestjs/graphql";

export enum AnswerMemoState {
  TEMP,
  SUBMITTED
}
registerEnumType(AnswerMemoState, {
  name: "AnswerMemoState"
});
