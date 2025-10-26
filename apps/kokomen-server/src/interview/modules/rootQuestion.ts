import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RootQuestion } from "src/interview/domains/rootQuestion";
import { RootQuestionService } from "src/interview/services/rootQuestion";

@Module({
  imports: [TypeOrmModule.forFeature([RootQuestion])],
  providers: [RootQuestionService]
})
export class RootQuestionModule {}
