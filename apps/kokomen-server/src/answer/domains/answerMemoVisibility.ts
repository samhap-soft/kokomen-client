import { registerEnumType } from "@nestjs/graphql";

export enum AnswerMemoVisibility {
  PUBLIC,
  PRIVATE,
  FRIENDS
}
registerEnumType(AnswerMemoVisibility, {
  name: "AnswerMemoVisibility"
});
