import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";
import { Member } from "../member/domains/member";
import { MemberSocialLogin } from "../member/domains/memberSocialLogin";
import { AuthService } from "./services/auth.service";
import { AppleAuthService } from "./services/apple-auth.service";
import { SpringSessionService } from "./services/spring-session.service";
import { AuthResolver } from "./auth.resolver";
import { SessionAuthGuardForHTTP } from "../globals/http-session-auth.guard";
import { RedisModule } from "../redis/redis.module";
import { MemberService } from "src/member/member.service";
import { SocialLoginService } from "src/auth/services/socialLogin.service";
import { TokenModule } from "src/token/token.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Member, MemberSocialLogin]),
    HttpModule,
    ConfigModule,
    RedisModule,
    TokenModule
  ],
  providers: [
    AuthService,
    AppleAuthService,
    SpringSessionService,
    AuthResolver,
    SessionAuthGuardForHTTP,
    MemberService,
    SocialLoginService
  ],
  exports: [
    AuthService,
    AppleAuthService,
    SpringSessionService,
    SessionAuthGuardForHTTP
  ]
})
export class AuthModule {}
