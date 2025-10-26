import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class GetRootQuestionsByCategoryResponse {
  @ApiProperty({
    description: "루트 질문 ID",
    example: 1
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: "루트 질문 내용",
    example: "혹시 개발하다가 밥을 못 먹은 적이 있나요?"
  })
  @IsString()
  content: string;

  constructor(id: number, content: string) {
    this.id = id;
    this.content = content;
  }
}
