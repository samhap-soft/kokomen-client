import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn
} from "typeorm";
import { Member } from "../../member/domains/member";
import { Answer } from "./answer";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
@Entity("answer_like")
export class AnswerLike {
  @Field(() => ID)
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: number;

  @Field(() => Int)
  @Column({ name: "member_id", type: "bigint" })
  memberId: number;

  @Field(() => Int)
  @Column({ name: "answer_id", type: "bigint" })
  answerId: number;

  @Field(() => Date)
  @CreateDateColumn({
    name: "created_at",
    type: "datetime",
    precision: 6,
    default: () => "CURRENT_TIMESTAMP(6)"
  })
  createdAt: Date;

  @Field(() => Member)
  @ManyToOne(() => Member, (member) => member.answerLikes)
  @JoinColumn({ name: "member_id" })
  member: Member;

  @Field(() => Answer)
  @ManyToOne(() => Answer, (answer) => answer.answerLikes)
  @JoinColumn({ name: "answer_id" })
  answer: Answer;
}
