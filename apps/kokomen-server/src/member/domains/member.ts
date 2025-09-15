import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany
} from "typeorm";
import { Interview } from "../../interview/domains/interview";
import { AnswerLike } from "../../answer/domains/answerLike";
import { InterviewLike } from "../../interview/domains/interviewLike";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
@Entity("member")
export class Member {
  @Field(() => ID)
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: number;

  @Field(() => Date)
  @CreateDateColumn({ name: "created_at", type: "datetime", precision: 6 })
  createdAt: Date;

  @Field(() => Int, { nullable: true })
  @Column({ name: "kakao_id", type: "bigint", nullable: true, unique: true })
  kakaoId: number | null;

  @Field(() => String, { nullable: true })
  @Column({ type: "varchar", length: 255, nullable: true })
  nickname: string | null;

  @Field(() => Int)
  @Column({ type: "int", default: 0 })
  score: number;

  @Field(() => Int)
  @Column({ name: "free_token_count", type: "int" })
  freeTokenCount: number;

  @Field(() => Boolean)
  @Column({ name: "profile_completed", type: "boolean" })
  profileCompleted: boolean;

  @Field(() => [Interview])
  @OneToMany(() => Interview, (interview) => interview.member)
  interviews: Interview[];

  @Field(() => [AnswerLike])
  @OneToMany(() => AnswerLike, (answerLike) => answerLike.member)
  answerLikes: AnswerLike[];

  @Field(() => [InterviewLike])
  @OneToMany(() => InterviewLike, (interviewLike) => interviewLike.member)
  interviewLikes: InterviewLike[];
}
