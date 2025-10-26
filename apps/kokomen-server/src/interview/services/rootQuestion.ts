import { Injectable, NotFoundException } from "@nestjs/common";
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

  async findById(id: number): Promise<RootQuestion> {
    const rootQuestion = await this.rootQuestionRepository.findOne({
      where: { id }
    });
    if (!rootQuestion) {
      throw new NotFoundException(`루트 질문 ${id}을 찾을 수 없습니다.`);
    }
    return rootQuestion;
  }
}
