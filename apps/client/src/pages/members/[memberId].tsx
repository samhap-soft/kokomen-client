import { getUserInfo } from "@/domains/auth/api";
import { User } from "@/domains/auth/types";
import MemberInterviewHistory from "@/domains/members/components/memberInterviewHistory";
import {
  GetServerSideProps,
  GetServerSidePropsResult,
  InferGetServerSidePropsType,
} from "next";
import { Layout } from "@kokomen/ui/components/layout";
import Header from "@/shared/header";
import { JSX } from "react";
import { getMemberInterviews } from "@/domains/members/api";
import { MemberInterview } from "@/domains/members/types";
import { CamelCasedProperties } from "@/utils/convertConvention";

export default function MemberInterviewPage({
  memberId,
  user,
  interviews,
  sort,
  page,
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  return (
    <Layout>
      <Header user={user} />
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-xl font-bold text-text-label mb-4">면접 기록</h1>
        <MemberInterviewHistory
          memberId={Number(memberId)}
          interviewSummaries={interviews.interviewSummaries}
          sort={sort}
          page={page}
        />
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<{
  memberId: string;
  user: User | null;
  interviews: CamelCasedProperties<MemberInterview>;
  sort: "asc" | "desc";
  page: number;
}> = async (
  context
): Promise<
  GetServerSidePropsResult<{
    memberId: string;
    user: User | null;
    interviews: CamelCasedProperties<MemberInterview>;
    sort: "asc" | "desc";
    page: number;
  }>
> => {
  const { memberId } = context.params as { memberId: string };
  const { sort, page } = context.query as { sort: string; page: string };
  if (!memberId) {
    return {
      notFound: true,
    };
  }
  const sortOption = sort === "asc" ? "asc" : "desc";
  const pageOption = isNaN(Number(page)) ? 0 : Number(page);
  const [user, interviews] = await Promise.allSettled([
    getUserInfo(context),
    getMemberInterviews(Number(memberId), pageOption, sortOption),
  ]);

  if (interviews.status === "fulfilled") {
    if (user.status === "rejected") {
      return {
        props: {
          memberId,
          user: null,
          interviews: interviews.value,
          sort: sortOption,
          page: pageOption,
        },
      };
    }
    return {
      props: {
        memberId,
        user: user.value.data,
        interviews: interviews.value,
        sort: sortOption,
        page: pageOption,
      },
    };
  }

  return {
    notFound: true,
  };
};
