import { Injectable, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";
import { Member } from "../../member/domains/member";
import * as crypto from "crypto";
import { JavaSerializer } from "src/auth/utils/javaSerializer";

export interface SpringSessionData {
  sessionId: string;
  memberId: number;
  createdAt: number;
  lastAccessedAt: number;
  maxInactiveInterval: number;
}

@Injectable()
export class SpringSessionService {
  private readonly SESSION_NAMESPACE = "spring:session";
  private readonly SESSION_PREFIX = `${this.SESSION_NAMESPACE}:sessions:`;
  private readonly DEFAULT_MAX_INACTIVE_INTERVAL = 1000 * 60 * 60 * 24; // 24시간

  constructor(
    @Inject("REDIS_CLIENT") private redis: Redis,
    private configService: ConfigService
  ) {}

  async createSession(member: Member): Promise<string> {
    const sessionId = this.generateSessionId();
    const now = Date.now();
    const maxInactiveInterval = this.configService.get<number>(
      "SESSION_MAX_INACTIVE_INTERVAL",
      this.DEFAULT_MAX_INACTIVE_INTERVAL
    );

    // Redis에 세션 데이터 저장 (Spring Session 형식으로 Java serialization)
    const sessionKey = `${this.SESSION_PREFIX}${sessionId}`;

    // Redis pipeline 사용
    const pipeline = this.redis.pipeline();

    // Java serialized 값으로 session hash 설정
    pipeline.hset(
      sessionKey,
      "lastAccessedTime",
      JavaSerializer.serializeLong(now)
    );
    pipeline.hset(
      sessionKey,
      "maxInactiveInterval",
      JavaSerializer.serializeInteger(maxInactiveInterval)
    );
    pipeline.hset(
      sessionKey,
      "creationTime",
      JavaSerializer.serializeLong(now)
    );
    pipeline.hset(
      sessionKey,
      "sessionAttr:MEMBER_ID",
      JavaSerializer.serializeLong(member.id)
    );

    // 세션 TTL 설정
    pipeline.expire(sessionKey, maxInactiveInterval);

    await pipeline.exec();

    // Base64 encoded sessionId 반환 (Spring Session 형식)
    return Buffer.from(sessionId).toString("base64");
  }

  async getSession(sessionId: string): Promise<SpringSessionData | null> {
    // Base64 sessionId 디코딩
    const decodedSessionId = Buffer.from(sessionId, "base64").toString("utf-8");
    const sessionKey = `${this.SESSION_PREFIX}${decodedSessionId}`;

    // 모든 세션 데이터를 buffer로 가져오기
    const sessionData = await this.redis.hgetallBuffer(sessionKey);

    if (!sessionData || Object.keys(sessionData).length === 0) {
      return null;
    }

    // 마지막 접근 시간 업데이트
    const now = Date.now();
    await this.redis.hset(
      sessionKey,
      "lastAccessedTime",
      JavaSerializer.serializeLong(now)
    );

    // member ID 디코딩
    const memberIdBuffer = sessionData["sessionAttr:MEMBER_ID"];
    if (!memberIdBuffer) {
      return null;
    }

    const memberId = JavaSerializer.deserializeLong(memberIdBuffer);
    const creationTime = JavaSerializer.deserializeLong(
      sessionData["creationTime"]
    );
    const maxInactiveInterval = JavaSerializer.deserializeInteger(
      sessionData["maxInactiveInterval"]
    );

    return {
      sessionId,
      memberId,
      createdAt: creationTime,
      lastAccessedAt: now,
      maxInactiveInterval
    };
  }

  async touchSession(sessionId: string): Promise<boolean> {
    // Base64 sessionId 디코딩
    const decodedSessionId = Buffer.from(sessionId, "base64").toString("utf-8");
    const sessionKey = `${this.SESSION_PREFIX}${decodedSessionId}`;
    const exists = await this.redis.exists(sessionKey);

    if (!exists) {
      return false;
    }

    const now = Date.now();
    await this.redis.hset(
      sessionKey,
      "lastAccessedTime",
      JavaSerializer.serializeLong(now)
    );

    // Refresh TTL
    const maxInactiveInterval = this.configService.get<number>(
      "SESSION_MAX_INACTIVE_INTERVAL",
      this.DEFAULT_MAX_INACTIVE_INTERVAL
    );
    await this.redis.expire(sessionKey, maxInactiveInterval);

    return true;
  }

  private generateSessionId(): string {
    // Spring Session 호환 ID 생성 (UUID v4 형식)
    const bytes = crypto.randomBytes(16);

    // 버전 (4)과 변종 비트 설정
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    // UUID
    const hex = bytes.toString("hex");
    return [
      hex.substring(0, 8),
      hex.substring(8, 12),
      hex.substring(12, 16),
      hex.substring(16, 20),
      hex.substring(20, 32)
    ].join("-");
  }
}
