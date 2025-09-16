import { registerEnumType } from "@nestjs/graphql";

export enum AnswerRank {
  A,
  B,
  C,
  D,
  F
}
registerEnumType(AnswerRank, {
  name: "AnswerRank"
});
