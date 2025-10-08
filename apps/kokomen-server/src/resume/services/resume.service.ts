import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ResumeEvaluationInput } from "src/resume/dto/resumeEvaluation.dto";
import { AWSBedrockFlowService } from "src/resume/services/awsBedrock.service";

@Injectable()
export class ResumeService {
  constructor(
    private readonly awsBedrockFlowService: AWSBedrockFlowService,
    private readonly configService: ConfigService
  ) {}

  async createResumeEvaluation(input: ResumeEvaluationInput) {
    const result = await this.awsBedrockFlowService.invokeFlow(
      this.configService.get("AWS_BEDROCK_RESUME_EVALUATION_FLOW_ID") as string,
      this.configService.get(
        "AWS_BEDROCK_RESUME_EVALUATION_FLOW_ALIAS_ID"
      ) as string,
      input
    );
    return result;
  }
}
