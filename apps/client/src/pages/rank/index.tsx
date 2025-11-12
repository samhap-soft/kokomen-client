import Header from "@/shared/header";
import {
  CamelCasedProperties,
  Paginated,
  Rank,
  UserInfo
} from "@kokomen/types";
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  InferGetServerSidePropsType
} from "next";
import { Footer } from "@/shared/footer";
import { SEO } from "@/shared/seo";
import { getPaginatedRankList } from "@/domains/members/api";
import { getUserInfo } from "@/domains/auth/api";
import PaginationButtons from "@/shared/paginationButtons";
import Link from "next/link";
import Image from "next/image";

export default function RankPage({
  rankList,
  topRank,
  userInfo
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <SEO
        title="면접 랭킹"
        description="모의 면접 랭킹을 확인해보고, 상위 랭커들의 면접을 보며 내 면접을 보완해 보세요."
        image="/ranking.png"
        robots="index, follow"
        pathname="/rank"
      >
        <link rel="canonical" href="https://kokomen.kr/rank"></link>
      </SEO>
      <main className="min-h-screen">
        <Header user={userInfo} />
        <div className="container mx-auto px-6 pt-6 pb-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">면접 랭킹</h1>
            <div className="flex justify-center items-center w-[60%] mx-auto flex-col">
              <Image
                src="/kokobot/rank.svg"
                alt="rank"
                width={100}
                height={100}
                className="w-full"
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center w-full my-5">
                {topRank.map((rank, index) => {
                  // md 이상: 2-1-3 순서, md 미만: 1-2-3 순서
                  // index 0(1위) -> order-1 md:order-2
                  // index 1(2위) -> order-2 md:order-1
                  // index 2(3위) -> order-3 md:order-3
                  const orderClasses =
                    index === 0
                      ? "order-1 md:order-2"
                      : index === 1
                        ? "order-2 md:order-1"
                        : "order-3 md:order-3";

                  return (
                    <Link
                      href={`/members/${rank.id}`}
                      key={rank.id}
                      className={`flex items-center justify-start gap-2 md:justify-center ${orderClasses} hover:bg-primary-bg-light p-2 rounded-md`}
                    >
                      <Image
                        src={"/kokobot/medal.svg"}
                        alt="rank"
                        width={30}
                        height={30}
                      />
                      <span className="shrink-0">{index + 1}위</span>
                      <p className="text-sm md:text-xl text-primary font-bold">
                        {rank.nickname ?? "탈퇴한 회원"}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="bg-bg-elevated rounded-3xl border border-border overflow-hidden">
              {rankList.data.map((rank: CamelCasedProperties<Rank>, index) => {
                const rankNumber = rankList.currentPage * 10 + index + 1;
                const isTopThree = rankNumber <= 3;

                return (
                  <Link
                    href={`/members/${rank.id}`}
                    key={rank.id}
                    className="flex items-center justify-between p-4 border-b border-border last:border-b-0 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div
                        className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg flex-shrink-0 ${
                          isTopThree
                            ? "bg-primary-bg-light text-primary"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {rankNumber}
                      </div>
                      <p className="font-semibold text-lg text-gray-900 truncate min-w-0 flex-1">
                        {rank.nickname ?? "탈퇴한 회원"}
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">
                          {rank.score}{" "}
                          <span className="text-sm text-gray-500">점</span>
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}

              {rankList.data.length === 0 && (
                <div className="p-12 text-center text-gray-500">
                  아직 랭킹 데이터가 없습니다.
                </div>
              )}
            </div>

            <div className="mt-8">
              <PaginationButtons
                currentPage={rankList.currentPage}
                totalPages={rankList.totalPages}
                hasNext={rankList.hasNext}
                options={{}}
                basePath="rank"
              />
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
): Promise<
  GetServerSidePropsResult<{
    rankList: CamelCasedProperties<Paginated<Rank[]>>;
    topRank: CamelCasedProperties<Rank>[];
    userInfo: UserInfo | null;
    page: number;
  }>
> => {
  const { page = 0 } = context.query;
  if (Number(page) > 0) {
    const [rankListResponse, topRankResponse, userInfoResponse] =
      await Promise.allSettled([
        getPaginatedRankList(Number(page)),
        getPaginatedRankList(0, 3),
        getUserInfo(context)
      ]);

    return {
      props: {
        page: Number(page),
        rankList:
          rankListResponse.status === "fulfilled"
            ? rankListResponse.value
            : {
                currentPage: 0,
                totalPages: 0,
                hasNext: false,
                data: []
              },
        topRank:
          topRankResponse.status === "fulfilled"
            ? topRankResponse.value.data.slice(0, 3)
            : [],
        userInfo:
          userInfoResponse.status === "fulfilled"
            ? userInfoResponse.value.data
            : null
      }
    };
  } else {
    const [rankListResponse, userInfoResponse] = await Promise.allSettled([
      getPaginatedRankList(),
      getUserInfo(context)
    ]);

    return {
      props: {
        page: 0,
        rankList:
          rankListResponse.status === "fulfilled"
            ? rankListResponse.value
            : {
                currentPage: 0,
                totalPages: 0,
                hasNext: false,
                data: []
              },
        topRank:
          rankListResponse.status === "fulfilled"
            ? rankListResponse.value.data.slice(0, 3)
            : [],
        userInfo:
          userInfoResponse.status === "fulfilled"
            ? userInfoResponse.value.data
            : null
      }
    };
  }
};
