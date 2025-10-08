import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Category } from "src/interview/domains/category";
import { Interview } from "src/interview/domains/interview";
import { RootQuestion } from "src/interview/domains/rootQuestion";
import { AWSBedrockFlowService } from "src/resume/services/awsBedrock.service";
import { ResumeService } from "src/resume/services/resume.service";
import { ResumeController } from "src/resume/controllers/resume.controller";
import { SpringSessionService } from "src/auth/services/spring-session.service";
import { SessionAuthGuardForGraphQL } from "src/globals/gql-session-auth.guard";
import { SessionAuthGuardForHTTP } from "src/globals/http-session-auth.guard";
import { Member } from "src/member/domains/member";

@Module({
  imports: [
    TypeOrmModule.forFeature([Interview, RootQuestion, Category, Member])
  ],
  controllers: [ResumeController],
  providers: [
    ResumeService,
    AWSBedrockFlowService,
    SpringSessionService,
    SessionAuthGuardForGraphQL,
    SessionAuthGuardForHTTP
  ]
})
export class ResumeModule {}
