import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne
} from "typeorm";
import { Interview } from "./interview";
import { Answer } from "../../answer/domains/answer";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
@Entity("question")
export class Question {
  @Field(() => ID)
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: number;

  @Field(() => Date)
  @Column({ name: "created_at", type: "datetime", precision: 6 })
  createdAt: Date;

  @Field(() => Int)
  @Column({ name: "interview_id", type: "bigint" })
  interviewId: number;

  @Field(() => String)
  @Column({ type: "varchar", length: 1000 })
  content: string;

  @Field(() => Interview)
  @ManyToOne(() => Interview, (interview) => interview.questions)
  @JoinColumn({ name: "interview_id" })
  interview: Interview;

  @Field(() => Answer)
  @OneToOne(() => Answer, (answer) => answer.question)
  answer: Answer;
}
