import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn
} from "typeorm";
import { Member } from "../../member/domains/member";
import { Interview } from "./interview";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
@Entity("interview_like")
export class InterviewLike {
  @Field(() => ID)
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: number;

  @Field(() => Int)
  @Column({ name: "member_id", type: "bigint" })
  memberId: number;

  @Field(() => Int)
  @Column({ name: "interview_id", type: "bigint" })
  interviewId: number;

  @Field(() => Date)
  @CreateDateColumn({
    name: "created_at",
    type: "datetime",
    precision: 6,
    default: () => "CURRENT_TIMESTAMP(6)"
  })
  createdAt: Date;

  @Field(() => Member)
  @ManyToOne(() => Member, (member) => member.interviewLikes)
  @JoinColumn({ name: "member_id" })
  member: Member;

  @Field(() => Interview)
  @ManyToOne(() => Interview, (interview) => interview.interviewLikes)
  @JoinColumn({ name: "interview_id" })
  interview: Interview;
}
