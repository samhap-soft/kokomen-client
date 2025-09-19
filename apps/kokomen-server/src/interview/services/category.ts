import { Injectable } from "@nestjs/common";
import { Category, CategoryType } from "../domains/category";

@Injectable()
export class CategoryService {
  private readonly categories: Category[];
  constructor() {
    this.categories = Category.getCategories();
  }

  async findAll(): Promise<Category[]> {
    return this.categories;
  }

  async findOne(type: CategoryType): Promise<Category | null> {
    const categories = Category.getCategories();
    return categories.find((category) => category.type === type) || null;
  }
}
