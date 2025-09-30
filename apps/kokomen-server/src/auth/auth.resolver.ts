import { Resolver, Mutation, Args, Context } from "@nestjs/graphql";
import { UseInterceptors } from "@nestjs/common";
import { Response } from "express";
import { AuthService } from "./services/auth.service";
import { AppleAuthInput, AuthResponse } from "./dto/apple-auth.dto";
import { TransactionInterceptor } from "src/globals/interceptors/transactionInterceptor";
import { TransactionManager } from "src/globals/decorators/transactionManager";
import { EntityManager } from "typeorm";

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponse, {
    description: "Authenticate with Apple Sign In"
  })
  @UseInterceptors(TransactionInterceptor)
  async appleAuth(
    @Args("input") input: AppleAuthInput,
    @TransactionManager() transactionManager: EntityManager,
    @Context() context: { req: any; res: Response }
  ): Promise<AuthResponse> {
    console.log("appleAuth Start");
    const { sessionId, member } = await this.authService.appleAuth(
      transactionManager,
      input
    );
    console.log("appleAuth SessionId", sessionId, member);

    // Set JSESSIONID cookie - GraphQL context에서 res 가져오기
    const response: Response = context.res;
    response.setHeader(
      "Set-Cookie",
      `JSESSIONID=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=1800`
    );

    return {
      id: member.id,
      nickname: member.nickname,
      profile_completed: member.profileCompleted
    };
  }
}
