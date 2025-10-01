import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  Unique
} from "typeorm";
import { Member } from "./member";
import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
@Entity("member_social_login")
@Unique(["member", "provider"])
@Index(["member", "provider"])
@Index(["socialId"])
export class MemberSocialLogin {
  @Field(() => ID)
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: number;

  @Field(() => Date)
  @Column({ name: "created_at", type: "datetime" })
  createdAt: Date;

  @Field(() => Member)
  @ManyToOne(() => Member, (member) => member.socialLogins, {
    onDelete: "CASCADE"
  })
  @JoinColumn({ name: "member_id" })
  member: Member;

  @Field(() => String)
  @Column({ type: "varchar", length: 255 })
  provider: string;

  @Field(() => String)
  @Column({ name: "social_id", type: "varchar", length: 255 })
  socialId: string;
}
