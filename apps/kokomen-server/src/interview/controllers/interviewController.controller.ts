import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Logger,
  UseInterceptors,
  Get,
  Query,
  BadRequestException
} from "@nestjs/common";
import { ApiTags, ApiBody, ApiOperation } from "@nestjs/swagger";
import { CreateCustomInterviewDto } from "../dto/createCustomInterview.dto";
import { SessionAuthGuardForHTTP } from "src/globals/http-session-auth.guard";
import { TransactionInterceptorForHTTP } from "src/globals/interceptors/transactionInterceptor";
import { TransactionManagerForHTTP } from "src/globals/decorators/transactionManager";
import { EntityManager } from "typeorm";
import { InterviewFacadeService } from "src/interview/services/interviewFacade.service";
import { AuthenticatedRequest } from "src/globals/types/request.type";
import { RootQuestionService } from "src/interview/services/rootQuestion";
import { CategoryType } from "src/interview/domains/category";
import { GetRootQuestionsByCategoryResponse } from "src/interview/dto/getRootQuestionsByCategroy.dto";

@ApiTags("Interview")
@Controller("interview")
@UseInterceptors(TransactionInterceptorForHTTP)
export class InterviewController {
  private readonly logger = new Logger(InterviewController.name);
  constructor(
    private readonly interviewFacadeService: InterviewFacadeService,
    private readonly rootQuestionService: RootQuestionService,
    @TransactionManagerForHTTP()
    private readonly transactionManager: EntityManager
  ) {}

  @Get("questions")
  @ApiOperation({
    summary: "카테고리별 루트 질문들 가져오기",
    description: "카테고리별 루트 질문들을 가져옵니다."
  })
  // @UseGuards(SessionAuthGuardForHTTP)
  async getQuestions(
    @Query("category") category: CategoryType
  ): Promise<GetRootQuestionsByCategoryResponse[]> {
    try {
      if (!category) {
        throw new BadRequestException("카테고리는 필수입니다.");
      }
      const rootQuestions =
        await this.rootQuestionService.findByCategory(category);
      return rootQuestions.map(
        (rootQuestion) =>
          new GetRootQuestionsByCategoryResponse(
            rootQuestion.id,
            rootQuestion.content
          )
      );
    } catch (error) {
      this.logger.error("getQuestions error", error);
      throw error;
    }
  }

  @Post("custom")
  @ApiOperation({
    summary: "Create a custom interview based on root question"
  })
  @ApiBody({ type: CreateCustomInterviewDto })
  @UseGuards(SessionAuthGuardForHTTP)
  async createCustomInterview(
    @Request() req: Request & AuthenticatedRequest,
    @Body() body: CreateCustomInterviewDto
  ) {
    try {
      const result = await this.interviewFacadeService.createCustomInterview(
        req.member,
        body,
        this.transactionManager
      );

      return {
        ...result
      };
    } catch (error) {
      this.logger.error("createCustomInterview error", error);
      throw error;
    }
  }
}
