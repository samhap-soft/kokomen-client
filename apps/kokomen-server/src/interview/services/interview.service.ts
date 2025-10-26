import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Interview } from "src/interview/domains/interview";
import { EntityManager, Repository } from "typeorm";
import { InterviewState } from "src/interview/domains/interviewState";

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
    const newInterview = transactionManager.create(Interview, {
      ...interview,
      interviewState: InterviewState.IN_PROGRESS,
      createdAt: new Date()
    });
    return transactionManager.save(newInterview);
  }

  async findByMemberId(memberId: number): Promise<Interview[]> {
    return this.interviewRepository.find({ where: { memberId } });
  }

  async getInterview(id: number): Promise<Interview | null> {
    return this.interviewRepository.findOne({
      where: { id }
    });
  }

  async updateInterview(interview: Interview): Promise<Interview> {
    return this.interviewRepository.save(interview);
  }

  async saveInterview(
    transactionManager: EntityManager,
    interview: Interview
  ): Promise<Interview> {
    const newInterview = transactionManager.create(Interview, interview);
    return transactionManager.save(newInterview);
  }
}
