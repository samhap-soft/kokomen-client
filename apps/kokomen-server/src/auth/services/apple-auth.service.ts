import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as jwt from "jsonwebtoken";
import { JwksClient } from "jwks-rsa";
import { AppleTokenPayload } from "../dto/apple-auth.dto";

@Injectable()
export class AppleAuthService {
  private readonly appleIssuer = "https://appleid.apple.com";
  private readonly appleKeysUrl = "https://appleid.apple.com/auth/keys";
  private readonly appleKeysCacheMaxAge = 600000;
  private readonly clientId: string;
  private jwksClient: JwksClient;

  constructor(private readonly configService: ConfigService) {
    this.clientId = this.configService.get<string>(
      "APPLE_CLIENT_ID",
      "kr.kokomen"
    );

    this.jwksClient = new JwksClient({
      jwksUri: this.appleKeysUrl,
      cache: true,
      cacheMaxAge: this.appleKeysCacheMaxAge
    });
  }

  async verifyIdentityToken(identityToken: string): Promise<AppleTokenPayload> {
    try {
      // token 디코딩
      const decodedToken = jwt.decode(identityToken, { complete: true });

      if (!decodedToken || typeof decodedToken === "string") {
        throw new UnauthorizedException("Invalid token format");
      }

      const { kid, alg } = decodedToken.header;
      if (!kid) {
        throw new UnauthorizedException("Token missing key id");
      }

      // Apple 서명 키 조회
      const key = await this.getSigningKey(kid);

      // token 검증
      const payload = jwt.verify(identityToken, key, {
        algorithms: [(alg as jwt.Algorithm) || "RS256"],
        issuer: this.appleIssuer,
        audience: this.clientId
      }) as AppleTokenPayload;

      // 추가 검증
      if (!payload.sub) {
        throw new UnauthorizedException("Invalid token: missing subject");
      }

      if (payload.iss !== this.appleIssuer) {
        throw new UnauthorizedException("Invalid token issuer");
      }

      if (payload.aud !== this.clientId) {
        throw new UnauthorizedException("Invalid token audience");
      }

      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        throw new UnauthorizedException("Token has expired");
      }

      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(
        `Token verification failed: ${error.message}`
      );
    }
  }

  private async getSigningKey(kid: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.jwksClient.getSigningKey(kid, (err, key) => {
        if (err || !key) {
          reject(err);
          return;
        }
        const signingKey = key.getPublicKey();
        resolve(signingKey);
      });
    });
  }
}
