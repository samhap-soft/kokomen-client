import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Question } from "src/interview/domains/question";
import { EntityManager, Repository } from "typeorm";

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>
  ) {}

  async createQuestion(
    transactionManager: EntityManager,
    question: Partial<Question>
  ): Promise<Question> {
    const newQuestion = transactionManager.create(Question, {
      ...question,
      createdAt: new Date()
    });
    return transactionManager.save(newQuestion);
  }

  async findByInterviewId(interviewId: number): Promise<Question[]> {
    return this.questionRepository.find({ where: { interviewId } });
  }

  async findById(id: number): Promise<Question | null> {
    return this.questionRepository.findOne({ where: { id } });
  }
}
