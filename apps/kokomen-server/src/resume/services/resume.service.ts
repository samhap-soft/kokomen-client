import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ResumeEvaluationInput } from "src/resume/dto/resumeEvaluation.dto";
import { AWSBedrockFlowService } from "src/resume/services/awsBedrock.service";

export interface ResumeEvaluationResult {
  technical_skills: {
    score: number;
    reason: string;
  };
  project_experience: {
    score: number;
    reason: string;
  };
  problem_solving: {
    score: number;
    reason: string;
  };
  career_growth: {
    score: number;
    reason: string;
  };
  documentation: {
    score: number;
    reason: string;
  };
  total_score: number;
  total_feedback: string;
}
@Injectable()
export class ResumeService {
  constructor(
    private readonly awsBedrockFlowService: AWSBedrockFlowService,
    private readonly configService: ConfigService
  ) {}

  async createResumeEvaluation(input: ResumeEvaluationInput) {
    const result: ResumeEvaluationResult =
      (await this.awsBedrockFlowService.invokeFlow(
        this.configService.get(
          "AWS_BEDROCK_RESUME_EVALUATION_FLOW_ID"
        ) as string,
        this.configService.get(
          "AWS_BEDROCK_RESUME_EVALUATION_FLOW_ALIAS_ID"
        ) as string,
        input
      )) as ResumeEvaluationResult;
    return result;
  }
}
