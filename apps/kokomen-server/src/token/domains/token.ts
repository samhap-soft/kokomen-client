import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index
} from "typeorm";
import { BadRequestException } from "@nestjs/common";

export enum TokenType {
  FREE = "FREE",
  PAID = "PAID"
}

@Entity("token")
@Index("uk_token_member_type", ["memberId", "type"], { unique: true })
export class Token {
  @PrimaryGeneratedColumn({ name: "id" })
  id: number;

  @Column({ name: "member_id", type: "bigint", nullable: false })
  memberId: number;

  @Column({
    name: "type",
    type: "enum",
    enum: TokenType,
    nullable: false
  })
  type: TokenType;

  @Column({ name: "token_count", type: "int", nullable: false, default: 0 })
  tokenCount: number;

  @CreateDateColumn({
    name: "created_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP"
  })
  createdAt: Date;

  // Constructor
  constructor(memberId: number, type: TokenType, tokenCount: number) {
    this.memberId = memberId;
    this.type = type;
    this.tokenCount = tokenCount;
  }

  // Business methods
  addTokens(count: number): void {
    if (count < 0) {
      throw new Error("Token count cannot be negative");
    }
    this.tokenCount += count;
  }

  useToken(): void {
    if (this.tokenCount <= 0) {
      throw new BadRequestException("Token count cannot be negative");
    }
    this.tokenCount--;
  }

  hasTokens(): boolean {
    return this.tokenCount > 0;
  }

  hasEnoughTokens(requiredCount: number): boolean {
    return this.tokenCount >= requiredCount;
  }

  setTokenCount(count: number): void {
    if (count < 0) {
      throw new Error("Token count cannot be negative");
    }
    this.tokenCount = count;
  }
}
