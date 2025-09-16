// guards/session.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject
} from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Redis } from "ioredis";

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(@Inject("REDIS_CLIENT") private redisClient: Redis) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // GraphQL과 HTTP 모두 지원
    const gqlContext = GqlExecutionContext.create(context);
    const request =
      gqlContext.getContext().req || context.switchToHttp().getRequest();

    // JSESSIONID 쿠키에서 세션 ID 추출
    const encodedSessionId = this.extractSessionId(request);
    const sessionId = this.extractSessionIdFromBase64(encodedSessionId);

    if (!sessionId) {
      return false;
    }

    try {
      // Redis에서 세션 정보 조회
      const sessionData = await this.getSessionFromRedis(sessionId);
      console.log("세션", sessionData);

      if (!sessionData) {
        return false;
      }

      // request 객체에 세션 정보 첨부
      request.session = sessionData;
      request.sessionId = sessionId;

      return true;
    } catch (error) {
      return false;
    }
  }

  private extractSessionIdFromBase64(sessionId: string | null): string | null {
    if (!sessionId) return null;
    return Buffer.from(sessionId, "base64").toString("utf-8");
  }

  private extractSessionId(request: any): string | null {
    const cookies = request.headers.cookie;
    if (!cookies) return null;

    const sessionCookie = cookies
      .split(";")
      .find((cookie: string) => cookie.trim().startsWith("JSESSIONID="));

    return sessionCookie ? sessionCookie.split("=")[1].trim() : null;
  }

  private async getSessionFromRedis(sessionId: string): Promise<any> {
    // Spring Session 형식에 맞춰 키 조회
    const sessionKey = `spring:session:sessions:${sessionId}`;

    try {
      const sessionData = await this.redisClient.hgetall(sessionKey);

      if (!sessionData || Object.keys(sessionData).length === 0) {
        return null;
      }

      // Spring Session 데이터 파싱
      return this.extractSessionIdFromSessionData(sessionData);
    } catch (error) {
      // 다른 키 형식으로 시도
      return null;
    }
  }

  private extractSessionIdFromSessionData(sessionData: any): any {
    for (const key in sessionData) {
      if (key === "sessionAttr:MEMBER_ID") {
        return this.parseJavaSerializedData(sessionData[key]);
      }
    }
    return null;
  }

  private parseJavaSerializedData(buffer: Buffer | string): any {
    // Buffer로 변환
    const data = Buffer.isBuffer(buffer)
      ? buffer
      : Buffer.from(buffer, "binary");

    // Java Long 타입 파싱 (8바이트)
    // Java Long은 마지막 8바이트에 실제 값이 저장됨
    if (data.length >= 8) {
      const longValue = data.readBigInt64BE(data.length - 8);
      return Number(longValue);
    }

    return null;
  }
}
