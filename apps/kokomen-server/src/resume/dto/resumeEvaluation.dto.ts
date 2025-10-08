import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ResumeEvaluationDto {
  @ApiProperty({
    type: "string",
    description: "Resume text(parsed from PDF)",
    required: true
  })
  @IsNotEmpty()
  resume: string;

  @ApiProperty({
    type: "string",
    description: "Portfolio text(parsed from PDF)",
    required: false
  })
  @IsOptional()
  portfolio?: string;

  @ApiProperty({
    description: "Job position title",
    example: "프론트엔드 개발자",
    required: true
  })
  @IsNotEmpty()
  @IsString()
  job_position: string;

  @ApiProperty({
    description: "Job description text",
    example: "우리는 기본기에 충실한 프론트엔드 개발자를 찾고 있습니다.",
    required: false
  })
  @IsOptional()
  @IsString()
  job_description?: string;

  @IsNotEmpty()
  @IsString()
  job_career: string;
}

export interface ResumeEvaluationInput {
  resume_text: string;
  portfolio_text?: string;
  job_position: string;
  job_description?: string;
  job_career: string;
}
