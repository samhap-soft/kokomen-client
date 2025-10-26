import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Logger
} from "@nestjs/common";
import { ApiTags, ApiBody, ApiOperation } from "@nestjs/swagger";
import {
  ResumeEvaluationDto,
  ResumeEvaluationInput
} from "../dto/resumeEvaluation.dto";
import {
  ResumeEvaluationResult,
  ResumeService
} from "src/resume/services/resume.service";

@ApiTags("Resume")
@Controller("resume")
export class ResumeController {
  private readonly logger = new Logger(ResumeController.name);
  constructor(private readonly resumeService: ResumeService) {}

  @Post("evaluation")
  @ApiOperation({
    summary: "Evaluate resume based on job position and description"
  })
  @ApiBody({ type: ResumeEvaluationDto })
  async evaluateResume(
    @Body()
    body: ResumeEvaluationDto
  ): Promise<ResumeEvaluationResult> {
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

      const result = await this.resumeService.createResumeEvaluation(input);
      return result;
    } catch (error) {
      this.logger.error("evaluateResume error", error);
      throw error;
    }
  }
}
