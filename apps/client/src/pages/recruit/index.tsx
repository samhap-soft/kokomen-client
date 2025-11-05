import Header from "@/shared/header";
import { RecruitFilters, UserInfo } from "@kokomen/types";
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  InferGetServerSidePropsType,
  Redirect
} from "next";
import { Footer } from "@/shared/footer";
import { SEO } from "@/shared/seo";
import { getUserInfo } from "@/domains/auth/api";
import { Recruits } from "@/domains/recruit/components";
import { getRecruitFilters } from "@/domains/recruit/api";
import Image from "next/image";

export default function RecruitPage({
  userInfo,
  filters
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <SEO
        title="채용 공고"
        description="꼬꼬면에서 채용 공고를 확인해보고, 내 이력서와 포트폴리오가 채용 공고에 얼마나 적합한지 평가해보세요."
        image="/recruit.png"
        robots="index, follow"
      />
      <main className="min-h-screen">
        <Header user={userInfo} />
        <div className="container mx-auto px-6 pt-6 pb-12">
          <div className="mx-auto">
            <h1 className="text-3xl font-bold text-text-heading mb-2">
              채용 공고
            </h1>
            <p className="text-sm text-text-description mb-6">
              채용 공고를 확인해보고, 내 이력서와 포트폴리오가 채용 공고에
              얼마나 적합한지 평가해보세요.
            </p>
          </div>
          <div className="bg-purple-1 p-6 rounded-xl flex items-center gap-6 mb-10">
            <Image src="/zighang.svg" alt="직행" width={100} height={100} />
            <p>
              본 채용 공고는{" "}
              <a
                href="https://zighang.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-6 hover:text-blue-7"
              >
                직행(zighang.com)
              </a>
              에서 제공됩니다.
            </p>
          </div>
          <Recruits filterOptions={filters} />
        </div>
        <Footer />
      </main>
    </>
  );
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
): Promise<
  | GetServerSidePropsResult<{
      userInfo: UserInfo | null;
      filters: RecruitFilters;
    }>
  | Redirect
> => {
  try {
    const [userInfoResponse, filters] = await Promise.all([
      getUserInfo(context)
        .then((res) => res.data)
        .catch(() => null),
      getRecruitFilters()
    ]);

    return {
      props: {
        userInfo: userInfoResponse ?? null,
        filters: filters
      }
    };
  } catch (error) {
    return {
      redirect: {
        destination: "/error",
        permanent: false
      }
    };
  }
};
