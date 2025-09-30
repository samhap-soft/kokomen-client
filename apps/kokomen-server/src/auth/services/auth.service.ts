import { Injectable } from "@nestjs/common";
import { EntityManager } from "typeorm";
import { Member } from "../../member/domains/member";
import { AppleAuthService } from "./apple-auth.service";
import { SpringSessionService } from "./spring-session.service";
import { AppleAuthInput } from "../dto/apple-auth.dto";
import { MemberService } from "src/member/member.service";
import { SocialLoginService } from "src/auth/services/socialLogin.service";
import { TokenService } from "src/token/services/token.service";

@Injectable()
export class AuthService {
  private readonly appleLoginProvider = "APPLE";
  constructor(
    private readonly memberService: MemberService,
    private readonly appleAuthService: AppleAuthService,
    private readonly springSessionService: SpringSessionService,
    private readonly socialLoginService: SocialLoginService,
    private readonly tokenService: TokenService
  ) {}

  async appleAuth(
    transactionManager: EntityManager,
    input: AppleAuthInput
  ): Promise<{ sessionId: string; member: Member }> {
    // apple identity token 검증
    const tokenPayload = await this.appleAuthService.verifyIdentityToken(
      input.identityToken
    );

    // 유저 정보 추출
    const appleUserId = tokenPayload.sub;

    // 소셜 로그인 아이디 조회
    let socialLogin = await this.socialLoginService.findById(
      appleUserId,
      this.appleLoginProvider
    );

    let member: Member | undefined = socialLogin?.member;
    if (!member) {
      // 소셜 로그인 아이디가 없으면 새로운 가입으로 취급
      const newMember = await this.memberService.create(transactionManager, {
        nickname: `꼬꼬면_${tokenPayload.sub.slice(0, 6)}`,
        createdAt: new Date(),
        profileCompleted: false
      });
      socialLogin = await this.socialLoginService.create(transactionManager, {
        member: newMember,
        provider: this.appleLoginProvider,
        socialId: appleUserId,
        createdAt: new Date()
      });
      member = newMember;
      await this.tokenService.createTokensForNewMember(
        transactionManager,
        member.id
      );
    }

    // spring session 형식에 맞춰 세션 정보 생성
    const sessionId = await this.springSessionService.createSession(member);

    return {
      sessionId,
      member
    };
  }
}
