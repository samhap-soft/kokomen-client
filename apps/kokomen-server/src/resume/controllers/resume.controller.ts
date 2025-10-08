import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Logger,
  UseGuards
} from "@nestjs/common";
import { ApiTags, ApiBody, ApiOperation } from "@nestjs/swagger";
import { CustomInterviewService } from "../services/resume.service";
import {
  ResumeEvaluationDto,
  ResumeEvaluationInput
} from "../dto/resumeEvaluation.dto";
import { SessionAuthGuard } from "src/globals/session-auth.guard";

@ApiTags("Resume")
@Controller("resume")
export class ResumeController {
  private readonly logger = new Logger(ResumeController.name);
  constructor(
    private readonly customInterviewService: CustomInterviewService
  ) {}

  @Post("evaluation")
  @ApiOperation({
    summary: "Evaluate resume based on job position and description"
  })
  @ApiBody({ type: ResumeEvaluationDto })
  @UseGuards(SessionAuthGuard)
  async evaluateResume(
    @Body()
    body: ResumeEvaluationDto
  ) {
    const { job_position, job_description, resume, portfolio, job_career } =
      body;

    if (!job_position || !resume) {
      throw new BadRequestException(
        "job_position and job_description are required"
      );
    }

    try {
      // Bedrock 입력 형식
      const input: ResumeEvaluationInput = {
        resume_text: resume,
        portfolio_text: portfolio,
        job_position,
        job_description,
        job_career
      };

      const result =
        await this.customInterviewService.createResumeEvaluation(input);
      return result;
    } catch (error) {
      this.logger.error("evaluateResume error", error);
      throw error;
    }
  }
}
