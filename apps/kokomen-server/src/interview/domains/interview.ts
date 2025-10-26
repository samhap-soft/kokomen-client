import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index
} from "typeorm";
import { Member } from "../../member/domains/member";
import { RootQuestion } from "./rootQuestion";
import { Question } from "./question";
import { InterviewLike } from "./interviewLike";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { InterviewMode } from "./interviewMode";
import { InterviewState } from "./interviewState";
import { BadRequestException } from "@nestjs/common";

@ObjectType()
@Entity("interview")
@Index("idx_interview_like_count", ["likeCount"])
@Index("idx_interview_view_count", ["viewCount"])
@Index("idx_interview_member_id_root_question_id", [
  "memberId",
  "rootQuestionId"
])
export class Interview {
  static readonly MIN_ALLOWED_MAX_QUESTION_COUNT = 3;
  static readonly MAX_ALLOWED_MAX_QUESTION_COUNT = 20;
  @Field(() => ID)
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: number;

  @Field(() => Date)
  @Column({
    name: "created_at",
    type: "datetime",
    precision: 6
  })
  createdAt: Date;

  @Field(() => Int)
  @Column({ name: "member_id", type: "bigint", nullable: false })
  memberId: number;

  @Field(() => Int)
  @Column({ name: "root_question_id", type: "bigint", nullable: false })
  rootQuestionId: number;

  @Field(() => Int)
  @Column({ name: "max_question_count", type: "int", nullable: false })
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
  @Column({
    name: "interview_state",
    type: "enum",
    enum: InterviewState,
    nullable: false
  })
  interviewState: InterviewState;

  @Field(() => InterviewMode)
  @Column({
    name: "interview_mode",
    type: "enum",
    enum: InterviewMode,
    nullable: false
  })
  interviewMode: InterviewMode;

  @Field(() => Int)
  @Column({ name: "like_count", type: "bigint", nullable: false, default: 0 })
  likeCount: number;

  @Field(() => Int)
  @Column({ name: "view_count", type: "bigint", nullable: false, default: 0 })
  viewCount: number;

  @Field(() => Date, { nullable: true })
  @Column({
    name: "finished_at",
    type: "datetime",
    precision: 6,
    nullable: true
  })
  finishedAt: Date | null;

  @Field(() => Member)
  @ManyToOne(() => Member, (member) => member.interviews, { lazy: true })
  @JoinColumn({ name: "member_id" })
  member: Member;

  @Field(() => RootQuestion)
  @ManyToOne(() => RootQuestion, (rootQuestion) => rootQuestion.interviews, {
    lazy: true
  })
  @JoinColumn({ name: "root_question_id" })
  rootQuestion: RootQuestion;

  @Field(() => [Question])
  @OneToMany(() => Question, (question) => question.interview)
  questions: Question[];

  @Field(() => [InterviewLike])
  @OneToMany(() => InterviewLike, (interviewLike) => interviewLike.interview)
  interviewLikes: InterviewLike[];

  // 팩토리 메서드
  static create(
    member: Member,
    rootQuestion: RootQuestion,
    maxQuestionCount: number,
    interviewMode: InterviewMode
  ): Interview {
    const interview = new Interview();
    interview.validateMaxQuestionCount(maxQuestionCount);
    interview.member = member;
    interview.rootQuestion = rootQuestion;
    interview.memberId = member.id;
    interview.rootQuestionId = rootQuestion.id;
    interview.maxQuestionCount = maxQuestionCount;
    interview.interviewMode = interviewMode;
    interview.interviewState = InterviewState.IN_PROGRESS;
    interview.likeCount = 0;
    interview.viewCount = 0;
    interview.createdAt = new Date();
    return interview;
  }

  // 비즈니스 로직 메서드
  private validateMaxQuestionCount(maxQuestionCount: number): void {
    if (
      maxQuestionCount < Interview.MIN_ALLOWED_MAX_QUESTION_COUNT ||
      maxQuestionCount > Interview.MAX_ALLOWED_MAX_QUESTION_COUNT
    ) {
      throw new BadRequestException(
        `최대 질문 개수는 ${Interview.MIN_ALLOWED_MAX_QUESTION_COUNT} 이상 ${Interview.MAX_ALLOWED_MAX_QUESTION_COUNT} 이하이어야 합니다.`
      );
    }
  }

  isInterviewee(memberId: number): boolean {
    return this.memberId === memberId;
  }

  isInProgress(): boolean {
    return this.interviewState === InterviewState.IN_PROGRESS;
  }

  evaluate(totalFeedback: string, totalScore: number): void {
    if (this.isInProgress()) {
      this.interviewState = InterviewState.FINISHED;
      this.totalFeedback = totalFeedback;
      this.totalScore = totalScore;
      this.finishedAt = new Date();
      return;
    }
    throw new BadRequestException("이미 종료된 인터뷰입니다.");
  }
}
