import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Category } from "src/interview/domains/category";
import { Interview } from "src/interview/domains/interview";
import { RootQuestion } from "src/interview/domains/rootQuestion";
import { AWSBedrockFlowService } from "src/resume/services/awsBedrock.service";
import { CustomInterviewService } from "src/resume/services/resume.service";
import { InterviewService } from "src/interview/services/interview.service";
import { ResumeController } from "src/resume/controllers/resume.controller";
import { SpringSessionService } from "src/auth/services/spring-session.service";
import { SessionAuthGuard } from "src/globals/session-auth.guard";
import { Member } from "src/member/domains/member";

@Module({
  imports: [
    TypeOrmModule.forFeature([Interview, RootQuestion, Category, Member])
  ],
  controllers: [ResumeController],
  providers: [
    InterviewService,
    CustomInterviewService,
    AWSBedrockFlowService,
    SpringSessionService,
    SessionAuthGuard
  ]
})
export class InterviewModule {}
