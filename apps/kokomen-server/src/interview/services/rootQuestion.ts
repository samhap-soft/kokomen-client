import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CategoryType } from "src/interview/domains/category";
import { RootQuestion } from "src/interview/domains/rootQuestion";
import { Repository } from "typeorm";

@Injectable()
export class RootQuestionService {
  constructor(
    @InjectRepository(RootQuestion)
    private readonly rootQuestionRepository: Repository<RootQuestion>
  ) {}
  findAll(): Promise<RootQuestion[]> {
    return this.rootQuestionRepository.find();
  }

  findByCategory(category: CategoryType): Promise<RootQuestion[]> {
    return this.rootQuestionRepository.find({ where: { category } });
  }
}
