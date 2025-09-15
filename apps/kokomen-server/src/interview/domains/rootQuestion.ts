import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany
} from "typeorm";
import { Interview } from "./interview";
import { Field, ID, Int, ObjectType, registerEnumType } from "@nestjs/graphql";

export enum QuestionCategory {
  ALGORITHM_DATA_STRUCTURE,
  DATABASE,
  NETWORK,
  OPERATING_SYSTEM,
  JAVA_SPRING,
  INFRA,
  FRONTEND,
  REACT,
  JAVASCRIPT_TYPESCRIPT
}

registerEnumType(QuestionCategory, {
  name: "QuestionCategory"
});

export enum QuestionState {
  ACTIVE,
  INACTIVE
}

registerEnumType(QuestionState, {
  name: "QuestionState"
});

@ObjectType()
@Entity("root_question")
export class RootQuestion {
  @Field(() => ID)
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: number;

  @Field(() => Date)
  @CreateDateColumn({ name: "created_at", type: "datetime", precision: 6 })
  createdAt: Date;

  @Field(() => String)
  @Column({ type: "varchar", length: 1000 })
  content: string;

  @Field(() => QuestionCategory)
  @Column({ type: "enum", enum: QuestionCategory })
  category: QuestionCategory;

  @Field(() => QuestionState)
  @Column({ type: "enum", enum: QuestionState })
  state: QuestionState;

  @Field(() => Int, { nullable: true })
  @Column({ name: "question_order", type: "int", nullable: true })
  questionOrder: number | null;

  @Field(() => [Interview])
  @OneToMany(() => Interview, (interview) => interview.rootQuestion)
  interviews: Interview[];
}
