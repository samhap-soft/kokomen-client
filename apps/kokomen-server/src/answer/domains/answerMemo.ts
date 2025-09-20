import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn
} from "typeorm";
import { Answer } from "./answer";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { AnswerMemoVisibility } from "src/answer/domains/answerMemoVisibility";
import { AnswerMemoState } from "src/answer/domains/answerMemoState";

@ObjectType()
@Entity("answer_memo")
export class AnswerMemo {
  @Field(() => ID)
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: number;

  @Field(() => String)
  @Column({ type: "varchar", length: 5000 })
  content: string;

  @Field(() => Int)
  @Column({ name: "answer_id", type: "bigint" })
  answerId: number;

  @Field(() => AnswerMemoVisibility)
  @Column({
    name: "answer_memo_visibility",
    type: "enum",
    enum: AnswerMemoVisibility
  })
  answerMemoVisibility: AnswerMemoVisibility;

  @Field(() => AnswerMemoState)
  @Column({ name: "answer_memo_state", type: "enum", enum: AnswerMemoState })
  answerMemoState: AnswerMemoState;

  @Field(() => Date)
  @CreateDateColumn({ name: "created_at", type: "datetime", precision: 6 })
  createdAt: Date;

  @Field(() => Answer)
  @ManyToOne(() => Answer, (answer) => answer.answerMemos)
  @JoinColumn({ name: "answer_id" })
  answer: Answer;
}
