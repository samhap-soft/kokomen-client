import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Interview } from "src/interview/domains/interview";
import { EntityManager, Repository } from "typeorm";

@Injectable()
export class InterviewService {
  constructor(
    @InjectRepository(Interview)
    private readonly interviewRepository: Repository<Interview>
  ) {}

  async findAll(): Promise<Interview[]> {
    return this.interviewRepository.find();
  }

  async createInterview(
    transactionManager: EntityManager,
    interview: Interview
  ): Promise<Interview> {
    const newInterview = transactionManager.create(Interview, interview);
    return transactionManager.save(newInterview);
  }

  async findByMemberId(memberId: number): Promise<Interview[]> {
    return this.interviewRepository.find({ where: { memberId } });
  }

  async getInterview(id: number): Promise<Interview | null> {
    return this.interviewRepository.findOne({
      where: { id }
    }) as Promise<Interview | null>;
  }

  async updateInterview(interview: Interview): Promise<Interview> {
    return this.interviewRepository.save(interview);
  }
}
