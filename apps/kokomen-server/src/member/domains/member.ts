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
import { MemberSocialLogin } from "./memberSocialLogin";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
@Entity("member")
export class Member {
  @Field(() => ID)
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: number;

  @Field(() => Date)
  @Column({ name: "created_at", type: "datetime", precision: 6 })
  createdAt: Date;

  @Field(() => String)
  @Column({ type: "varchar", length: 255, nullable: true })
  nickname: string;

  @Field(() => Int)
  @Column({ type: "int", default: 0 })
  score: number;

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

  @Field(() => [MemberSocialLogin])
  @OneToMany(() => MemberSocialLogin, (socialLogin) => socialLogin.member)
  socialLogins: MemberSocialLogin[];
}
