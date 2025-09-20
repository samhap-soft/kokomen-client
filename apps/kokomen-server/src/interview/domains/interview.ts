import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany
} from "typeorm";
import { Member } from "../../member/domains/member";
import { RootQuestion } from "./rootQuestion";
import { Question } from "./question";
import { InterviewLike } from "./interviewLike";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { InterviewMode } from "src/interview/domains/interviewMode";
import { InterviewState } from "src/interview/domains/interviewState";

@ObjectType()
@Entity("interview")
export class Interview {
  @Field(() => ID)
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: number;

  @Field(() => Date)
  @CreateDateColumn({ name: "created_at", type: "datetime", precision: 6 })
  createdAt: Date;

  @Field(() => Int)
  @Column({ name: "member_id", type: "bigint" })
  memberId: number;

  @Field(() => Int)
  @Column({ name: "root_question_id", type: "bigint" })
  rootQuestionId: number;

  @Field(() => Int)
  @Column({ name: "max_question_count", type: "int" })
  maxQuestionCount: number;

  @Field(() => Int, { nullable: true })
  @Column({ name: "total_score", type: "int", nullable: true })
  totalScore: number | null;

  @Field(() => String, { nullable: true })
  @Column({
    name: "total_feedback",
    type: "varchar",
    length: 2000,
    nullable: true
  })
  totalFeedback: string | null;

  @Field(() => InterviewState)
  @Column({ name: "interview_state", type: "enum", enum: InterviewState })
  interviewState: InterviewState;

  @Field(() => Int, { nullable: true })
  @Column({ name: "like_count", type: "bigint", nullable: true })
  likeCount: number | null;

  @Field(() => Int, { nullable: true })
  @Column({ name: "view_count", type: "bigint", nullable: true })
  viewCount: number | null;

  @Field(() => InterviewMode)
  @Column({ name: "interview_mode", type: "enum", enum: InterviewMode })
  interviewMode: InterviewMode;

  @Field(() => Member)
  @ManyToOne(() => Member, (member) => member.interviews)
  @JoinColumn({ name: "member_id" })
  member: Member;

  @Field(() => RootQuestion)
  @ManyToOne(() => RootQuestion, (rootQuestion) => rootQuestion.interviews)
  @JoinColumn({ name: "root_question_id" })
  rootQuestion: RootQuestion;

  @Field(() => [Question])
  @OneToMany(() => Question, (question) => question.interview)
  questions: Question[];

  @Field(() => [InterviewLike])
  @OneToMany(() => InterviewLike, (interviewLike) => interviewLike.interview)
  interviewLikes: InterviewLike[];
}
