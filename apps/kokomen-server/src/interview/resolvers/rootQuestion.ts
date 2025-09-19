import { Args, Query, Resolver } from "@nestjs/graphql";
import { CategoryType } from "src/interview/domains/category";
import { RootQuestion } from "src/interview/domains/rootQuestion";
import { RootQuestionService } from "src/interview/services/rootQuestion";

@Resolver(() => RootQuestion)
export class RootQuestionResolver {
  constructor(private readonly rootQuestionService: RootQuestionService) {}

  @Query(() => [RootQuestion])
  async rootQuestions(): Promise<RootQuestion[]> {
    return this.rootQuestionService.findAll();
  }

  @Query(() => [RootQuestion])
  async rootQuestionByCategory(
    @Args("category", { type: () => CategoryType }) category: CategoryType
  ): Promise<RootQuestion[]> {
    return this.rootQuestionService.findByCategory(category);
  }
}
