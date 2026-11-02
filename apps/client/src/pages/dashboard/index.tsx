import { getUserInfo } from "@/domains/auth/api";
import Header from "@/shared/header";
import { Footer } from "@/shared/footer";
import { withCheckInServer } from "@/utils/auth";
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  InferGetServerSidePropsType
} from "next";
import SelectSection from "@/domains/dashboard/components/selectSection";
import { JSX } from "react";
import { SEO } from "@/shared/seo";
import { Chip, MyProfileIcon } from "@kokomen/ui";
import { UserInfo } from "@kokomen/types";
import Streak from "@/domains/dashboard/components/streak";

export default function Dashboard({
  userInfo
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  const percentile = Math.round(
    (userInfo.rank / userInfo.total_member_count) * 100
  );
  const summaries: string[] = [
    `${userInfo.rank}위`,
    `상위 ${percentile}%`,
    `${userInfo.score ?? 0}점`,
    `${userInfo.token_count ?? 0} 토큰`
  ];

  return (
    <>
      <SEO
        title="마이페이지"
        robots="noindex, nofollow, noarchive"
        pathname="/dashboard"
      />

      <main className="min-h-screen">
        <Header user={userInfo} />
        <div className="mx-auto flex w-full max-w-[1182px] flex-col gap-[50px] px-5 pt-8 pb-[100px] xl:px-0">
          <div className="flex flex-col gap-5">
            <h1 className="text-[36px] leading-9 font-bold text-text-primary">
              마이페이지
            </h1>
            <p className="text-xl font-medium text-text-secondary">
              쌓아온 연습을 돌아보고, 다음 면접을 준비해 보세요.
            </p>
          </div>

          <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-1.5">
                <MyProfileIcon size={48} className="text-primary" />
                <div className="flex flex-col gap-1">
                  <p className="text-2xl font-bold text-text-primary">
                    {userInfo.nickname || "사용자"}
                  </p>
                  <p className="text-sm text-text-secondary">
                    나의 면접 성장 기록
                  </p>
                </div>
              </div>
              <ul
                className="flex flex-wrap gap-2"
                aria-label="내 순위와 보유 토큰"
              >
                {summaries.map((summary) => (
                  <li key={summary}>
                    <Chip
                      size="large"
                      className="pointer-events-none"
                      tabIndex={-1}
                    >
                      {summary}
                    </Chip>
                  </li>
                ))}
              </ul>
            </div>
            <Streak />
          </section>

          <SelectSection userInfo={userInfo} />
        </div>
        <Footer />
      </main>
    </>
  );
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<{ userInfo: UserInfo }>> => {
  return withCheckInServer(
    async () => {
      const userInfo = await getUserInfo(context);
      return {
        data: {
          userInfo: userInfo.data
        }
      };
    },
    { context, redirectPathWhenUnauthorized: "/dashboard" }
  );
};
