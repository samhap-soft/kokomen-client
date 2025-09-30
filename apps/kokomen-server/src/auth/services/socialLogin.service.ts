import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityManager, Repository } from "typeorm";
import { MemberSocialLogin } from "src/member/domains/memberSocialLogin";

@Injectable()
export class SocialLoginService {
  constructor(
    @InjectRepository(MemberSocialLogin)
    private memberSocialLoginRepository: Repository<MemberSocialLogin>
  ) {}

  async findAll(): Promise<MemberSocialLogin[]> {
    return this.memberSocialLoginRepository.find();
  }

  async findById(
    socialId: string,
    provider: string
  ): Promise<MemberSocialLogin | null> {
    return this.memberSocialLoginRepository.findOne({
      where: { socialId, provider },
      relations: ["member"]
    });
  }

  async create(
    transactionManager: EntityManager,
    memberData: Partial<MemberSocialLogin>
  ): Promise<MemberSocialLogin> {
    const member = this.memberSocialLoginRepository.create(memberData);
    return transactionManager.save(member);
  }
}
