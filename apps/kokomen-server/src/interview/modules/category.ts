import { Module } from "@nestjs/common";
import { CategoryService } from "src/interview/services/category";

@Module({
  providers: [CategoryService]
})
export class CategoryModule {}
