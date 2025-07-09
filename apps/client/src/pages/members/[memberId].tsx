import { getUserInfo } from "@/domains/auth/api";
import { User } from "@/domains/auth/types";
import MemberInterviewHistory from "@/domains/members/components/memberInterviewHistory";
import { isAxiosError } from "axios";
import {
  GetServerSideProps,
  GetServerSidePropsResult,
  InferGetServerSidePropsType,
} from "next";
import { Layout } from "@kokomen/ui/components/layout";
import Header from "@/shared/header";
import { JSX } from "react";

export default function MemberInterviewPage({
  memberId,
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  return (
    <Layout>
      <Header user={user} />
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-xl font-bold text-text-label mb-4">면접 기록</h1>
        <MemberInterviewHistory memberId={Number(memberId)} />
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<{
  memberId: string;
  user: User | null;
}> = async (
  context
): Promise<
  GetServerSidePropsResult<{ memberId: string; user: User | null }>
> => {
  const { memberId } = context.params as { memberId: string };
  if (!memberId) {
    return {
      notFound: true,
    };
  }
  try {
    const { data: user } = await getUserInfo(context);
    if (user.id) {
      return {
        props: { memberId, user },
      };
    }
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 401) {
      return {
        props: { memberId, user: null },
      };
    }
  }
  return {
    redirect: {
      destination: "/error",
      permanent: false,
    },
  };
};
