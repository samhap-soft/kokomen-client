import { IsNumber, IsEnum, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { InterviewMode } from "../domains/interviewMode";

export class CreateCustomInterviewDto {
  @ApiProperty({
    description: "Root question ID to base the interview on",
    example: 1
  })
  @IsNumber()
  rootQuestionId: number;

  @ApiProperty({
    description: "Minimum number of questions for the interview",
    example: 3,
    required: false,
    default: 3
  })
  @IsNumber()
  maxQuestionCount: number;

  @ApiProperty({
    description: "Interview mode (TEXT or VOICE)",
    enum: InterviewMode,
    example: InterviewMode.TEXT
  })
  @IsEnum(InterviewMode)
  mode: InterviewMode;
}

export class CreateCustomInterviewTextModeResponse {
  @ApiProperty({
    description: "Interview ID",
    example: 1
  })
  @IsNumber()
  interview_id: number;

  @ApiProperty({
    description: "Question ID",
    example: 1
  })
  @IsNumber()
  question_id: number;

  @ApiProperty({
    description: "루트 질문",
    example: "혹시 개발하다가 밥을 못 먹은 적이 있나요?"
  })
  @IsString()
  root_question: string;

  constructor(
    interview_id: number,
    question_id: number,
    root_question: string
  ) {
    this.interview_id = interview_id;
    this.question_id = question_id;
    this.root_question = root_question;
  }
}

export class CreateCustomInterviewVoiceModeResponse {
  @ApiProperty({
    description: "Interview ID",
    example: 1
  })
  @IsNumber()
  interview_id: number;

  @ApiProperty({
    description: "Question ID",
    example: 1
  })
  @IsNumber()
  question_id: number;

  @ApiProperty({
    description: "루트질문 voice URL",
    example: "https://example.com/voice.mp3"
  })
  @IsString()
  root_question_voice_url: string;

  constructor(
    interview_id: number,
    question_id: number,
    root_question_voice_url: string
  ) {
    this.interview_id = interview_id;
    this.question_id = question_id;
    this.root_question_voice_url = root_question_voice_url;
  }
}
