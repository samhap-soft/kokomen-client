import { Injectable, Logger } from "@nestjs/common";
import { Interview } from "src/interview/domains/interview";
import {
  getInterviewModeTokenCount,
  InterviewMode
} from "src/interview/domains/interviewMode";
import {
  CreateCustomInterviewDto,
  CreateCustomInterviewTextModeResponse,
  CreateCustomInterviewVoiceModeResponse
} from "src/interview/dto/createCustomInterview.dto";
import { InterviewService } from "src/interview/services/interview.service";
import { QuestionService } from "src/interview/services/question.service";
import { RootQuestionService } from "src/interview/services/rootQuestion";
import { QuestionVoicePathResolverService } from "./questionVoicePathResolver.service";
import { Member } from "src/member/domains/member";
import { EntityManager } from "typeorm";
import { TokenService } from "src/token/services/token.service";

@Injectable()
export class InterviewFacadeService {
  private readonly logger = new Logger(InterviewFacadeService.name);
  constructor(
    private readonly interviewService: InterviewService,
    private readonly rootQuestionService: RootQuestionService,
    private readonly tokenService: TokenService,
    private readonly questionService: QuestionService,
    private readonly questionVoicePathResolver: QuestionVoicePathResolverService
  ) {}

  async createCustomInterview(
    member: Member,
    { rootQuestionId, mode, maxQuestionCount }: CreateCustomInterviewDto,
    transactionManager: EntityManager
  ): Promise<
    | CreateCustomInterviewTextModeResponse
    | CreateCustomInterviewVoiceModeResponse
  > {
    const requiredTokenCount =
      maxQuestionCount * getInterviewModeTokenCount(mode);
    await this.tokenService.validateEnoughTokens(member.id, requiredTokenCount);
    const rootQuestion =
      await this.rootQuestionService.findById(rootQuestionId);
    const interview = await this.interviewService.saveInterview(
      transactionManager,
      Interview.create(member, rootQuestion, maxQuestionCount, mode)
    );

    const initialQuestion = await this.questionService.createQuestion(
      transactionManager,
      {
        interviewId: interview.id,
        content: rootQuestion.content
      }
    );

    if (mode === InterviewMode.VOICE) {
      return new CreateCustomInterviewVoiceModeResponse(
        interview.id,
        initialQuestion.id,
        this.questionVoicePathResolver.resolveNextQuestionCdnPath(
          initialQuestion.id
        )
      );
    } else {
      return new CreateCustomInterviewTextModeResponse(
        interview.id,
        initialQuestion.id,
        rootQuestion.content
      );
    }
  }
}
