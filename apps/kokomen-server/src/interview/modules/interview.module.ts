import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Interview } from "src/interview/domains/interview";
import { Question } from "src/interview/domains/question";
import { RootQuestion } from "src/interview/domains/rootQuestion";
import { InterviewController } from "src/interview/controllers/interviewController.controller";
import { InterviewService } from "src/interview/services/interview.service";
import { QuestionService } from "src/interview/services/question.service";
import { RootQuestionService } from "src/interview/services/rootQuestion";
import { InterviewFacadeService } from "src/interview/services/interviewFacade.service";
import { QuestionVoicePathResolverService } from "src/interview/services/questionVoicePathResolver.service";
import { SpringSessionService } from "src/auth/services/spring-session.service";
import { TokenService } from "src/token/services/token.service";
import { Token } from "src/token/domains/token";
import { Member } from "src/member/domains/member";

@Module({
  imports: [
    TypeOrmModule.forFeature([Interview, Question, RootQuestion, Token, Member])
  ],
  controllers: [InterviewController],
  providers: [
    InterviewService,
    QuestionService,
    RootQuestionService,
    InterviewFacadeService,
    QuestionVoicePathResolverService,
    SpringSessionService,
    TokenService
  ],
  exports: [InterviewService, QuestionService, InterviewFacadeService]
})
export class InterviewModule {}
