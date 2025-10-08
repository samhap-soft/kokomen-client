import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger
} from "@nestjs/common";
import { SpringSessionService } from "../auth/services/spring-session.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Member } from "../member/domains/member";

@Injectable()
export class SessionAuthGuardForHTTP implements CanActivate {
  private readonly logger = new Logger(SessionAuthGuardForHTTP.name);
  constructor(
    private readonly springSessionService: SpringSessionService,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Get JSESSIONID from cookie
    const sessionId = request.cookies?.JSESSIONID;

    if (!sessionId) {
      throw new UnauthorizedException("No session found");
    }

    // Validate session
    const sessionData = await this.springSessionService.getSession(sessionId);
    this.logger.log("sessionData", sessionData);

    if (!sessionData) {
      throw new UnauthorizedException("Invalid or expired session");
    }

    // Get member data
    const member = await this.memberRepository.findOne({
      where: { id: sessionData.memberId }
    });

    if (!member) {
      throw new UnauthorizedException("Member not found");
    }

    // Attach member to request
    request.member = member;

    return true;
  }
}
