import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany
} from "typeorm";
import { Question } from "../../interview/domains/question";
import { AnswerLike } from "./answerLike";
import { AnswerMemo } from "./answerMemo";
import { AnswerRank } from "./answerRank";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
@Entity("answer")
export class Answer {
  @Field(() => ID)
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: number;

  @Field(() => Date)
  @CreateDateColumn({ name: "created_at", type: "datetime", precision: 6 })
  createdAt: Date;

  @Field(() => ID)
  @Column({ name: "question_id", type: "bigint", unique: true })
  questionId: number;

  @Field(() => String)
  @Column({ type: "varchar", length: 2000 })
  content: string;

  @Field(() => String, { nullable: true })
  @Column({ type: "varchar", length: 2000, nullable: true })
  feedback: string | null;

  @Field(() => AnswerRank)
  @Column({ name: "answer_rank", type: "enum", enum: AnswerRank })
  answerRank: AnswerRank;

  @Field(() => Int, { nullable: true })
  @Column({ name: "like_count", type: "bigint", nullable: true })
  likeCount: number | null;

  @Field(() => Question)
  @OneToOne(() => Question, (question) => question.answer)
  @JoinColumn({ name: "question_id" })
  question: Question;

  @Field(() => [AnswerLike])
  @OneToMany(() => AnswerLike, (answerLike) => answerLike.answer)
  answerLikes: AnswerLike[];

  @Field(() => [AnswerMemo])
  @OneToMany(() => AnswerMemo, (answerMemo) => answerMemo.answer)
  answerMemos: AnswerMemo[];
}
