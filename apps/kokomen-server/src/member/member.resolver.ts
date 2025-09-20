import {
  Resolver,
  Query,
  Args,
  Int,
  ResolveField,
  Parent
} from "@nestjs/graphql";
import { Member } from "./domains/member";
import { MemberService } from "./member.service";

@Resolver(() => Member)
export class MemberResolver {
  constructor(private readonly memberService: MemberService) {}

  @Query(() => [Member])
  async members(): Promise<Member[]> {
    return this.memberService.findAll();
  }

  @Query(() => Member, { nullable: true })
  async member(
    @Args("id", { type: () => Int }) id: number
  ): Promise<Member | null> {
    return this.memberService.findById(id);
  }

  @ResolveField(() => Int)
  async completedInterviews(@Parent() member: Member): Promise<number> {
    const stats = await this.memberService.getMemberInterviewStats(member.id);
    return stats.completedInterviews;
  }

  @ResolveField(() => Number)
  async averageScore(@Parent() member: Member): Promise<number> {
    const stats = await this.memberService.getMemberInterviewStats(member.id);
    return stats.averageScore;
  }
}
