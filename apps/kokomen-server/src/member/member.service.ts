import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityManager, Repository } from "typeorm";
import { Member } from "./domains/member";
import { InterviewState } from "src/interview/domains/interviewState";

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>
  ) {}

  async findAll(): Promise<Member[]> {
    return this.memberRepository.find({
      relations: ["interviews", "answerLikes", "interviewLikes"]
    });
  }

  async findById(id: number): Promise<Member | null> {
    return this.memberRepository.findOne({
      where: { id },
      relations: ["interviews", "answerLikes", "interviewLikes"]
    });
  }

  async create(
    transactionManager: EntityManager,
    memberData: Partial<Member>
  ): Promise<Member> {
    const member = this.memberRepository.create(memberData);
    return transactionManager.save(member);
  }

  async updateScore(id: number, score: number): Promise<Member | null> {
    await this.memberRepository.update(id, { score });
    return this.findById(id);
  }

  async getMemberInterviewStats(id: number): Promise<{
    totalInterviews: number;
    completedInterviews: number;
    averageScore: number;
  }> {
    const member = await this.memberRepository.findOne({
      where: { id },
      relations: ["interviews"]
    });

    if (!member) {
      throw new Error("Member not found");
    }

    const totalInterviews = member.interviews.length;
    const completedInterviews = member.interviews.filter(
      (interview) => interview.interviewState === InterviewState.FINISHED
    ).length;
    const averageScore =
      member.interviews
        .filter((interview) => interview.totalScore !== null)
        .reduce((sum, interview) => sum + (interview.totalScore || 0), 0) /
      (member.interviews.filter((interview) => interview.totalScore !== null)
        .length || 1);

    return {
      totalInterviews,
      completedInterviews,
      averageScore: Math.round(averageScore * 100) / 100
    };
  }
}
