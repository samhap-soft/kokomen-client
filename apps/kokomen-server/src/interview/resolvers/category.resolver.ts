import { Resolver, Query, Args } from "@nestjs/graphql";
import { Category, CategoryType } from "src/interview/domains/category";
import { CategoryService } from "src/interview/services/category";

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) {}

  @Query(() => [Category])
  async categories(): Promise<Category[]> {
    return this.categoryService.findAll();
  }

  @Query(() => Category, { nullable: true })
  async category(
    @Args("type", { type: () => CategoryType }) type: CategoryType
  ): Promise<Category | null> {
    return this.categoryService.findOne(type);
  }
}
