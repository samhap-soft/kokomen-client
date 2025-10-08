import { Module } from "@nestjs/common";
import { CategoryResolver } from "src/interview/resolvers/category.resolver";
import { CategoryService } from "src/interview/services/category";

@Module({
  providers: [CategoryService, CategoryResolver]
})
export class CategoryModule {}
