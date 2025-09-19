import { Injectable } from "@nestjs/common";
import { Category, CategoryType } from "../domains/category";

@Injectable()
export class CategoryService {
  async findAll(): Promise<Category[]> {
    return Category.getCategories();
  }

  async findOne(type: CategoryType): Promise<Category | null> {
    const categories = Category.getCategories();
    return categories.find((category) => category.type === type) || null;
  }
}
