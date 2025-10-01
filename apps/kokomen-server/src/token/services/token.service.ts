import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityManager, Repository } from "typeorm";
import { Token, TokenType } from "../domains/token";
import { BadRequestException } from "@nestjs/common";

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);
  public static readonly DAILY_FREE_TOKEN_COUNT = 20;

  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>
  ) {}

  async createTokensForNewMember(
    transactionManager: EntityManager,
    memberId: number
  ): Promise<void> {
    const freeToken = new Token(
      memberId,
      TokenType.FREE,
      TokenService.DAILY_FREE_TOKEN_COUNT
    );
    const paidToken = new Token(memberId, TokenType.PAID, 0);

    await transactionManager.save(freeToken);
    await transactionManager.save(paidToken);
  }

  async addPaidTokens(memberId: number, count: number): Promise<void> {
    const result = await this.tokenRepository.increment(
      { memberId, type: TokenType.PAID },
      "tokenCount",
      count
    );

    if (!result.affected || result.affected === 0) {
      throw new Error(`Failed to add paid tokens. memberId: ${memberId}`);
    }
  }

  async setFreeTokens(memberId: number, count: number): Promise<void> {
    const freeToken = await this.readTokenByMemberIdAndType(
      memberId,
      TokenType.FREE
    );
    freeToken.setTokenCount(count);
    await this.tokenRepository.save(freeToken);
  }

  async useFreeToken(memberId: number): Promise<void> {
    const freeToken = await this.readTokenByMemberIdAndType(
      memberId,
      TokenType.FREE
    );
    freeToken.useToken();
    await this.tokenRepository.save(freeToken);
  }

  async usePaidToken(memberId: number): Promise<void> {
    const paidToken = await this.readTokenByMemberIdAndType(
      memberId,
      TokenType.PAID
    );
    paidToken.useToken();
    await this.tokenRepository.save(paidToken);
  }

  async refundPaidTokenCount(memberId: number, count: number): Promise<void> {
    const result = await this.tokenRepository.decrement(
      { memberId, type: TokenType.PAID },
      "tokenCount",
      count
    );

    if (!result.affected || result.affected === 0) {
      throw new Error(`Failed to refund paid tokens. memberId: ${memberId}`);
    }
  }

  async validateEnoughTokens(
    memberId: number,
    requiredCount: number
  ): Promise<void> {
    const hasEnough = await this.hasEnoughTokens(memberId, requiredCount);
    if (!hasEnough) {
      throw new BadRequestException("Not enough tokens");
    }
  }

  async hasEnoughTokens(
    memberId: number,
    requiredCount: number
  ): Promise<boolean> {
    const totalCount = await this.calculateTotalTokenCount(memberId);
    return totalCount >= requiredCount;
  }

  private async calculateTotalTokenCount(memberId: number): Promise<number> {
    const freeCount = await this.readFreeTokenCount(memberId);
    const paidCount = await this.readPaidTokenCount(memberId);
    return freeCount + paidCount;
  }

  async readFreeTokenCount(memberId: number): Promise<number> {
    const token = await this.readTokenByMemberIdAndType(
      memberId,
      TokenType.FREE
    );
    return token.tokenCount;
  }

  async readPaidTokenCount(memberId: number): Promise<number> {
    const token = await this.readTokenByMemberIdAndType(
      memberId,
      TokenType.PAID
    );
    return token.tokenCount;
  }

  async readTokenByMemberIdAndType(
    memberId: number,
    type: TokenType
  ): Promise<Token> {
    const token = await this.tokenRepository.findOne({
      where: { memberId, type }
    });

    if (!token) {
      throw new Error(`Token not found. type: ${type}`);
    }

    return token;
  }
}
