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
import { Badge, buttonVariants, Pagination } from "@kokomen/ui";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { JSX } from "react";

type RankItem = CamelCasedProperties<Rank>;

const formatScore = (score: number): string =>
  `${score.toLocaleString("ko-KR")}점`;

const getNickname = (rank: RankItem): string =>
  rank.nickname ?? "탈퇴한 회원";

/** 순위 열은 모바일에서 40px, md 이상에서 Figma 와 같은 80px 이다. */
const rowClassName: string =
  "flex items-center gap-3 px-3 py-4 md:gap-6 md:p-5";
const rankColumnClassName: string = "w-10 shrink-0 md:w-20";

/** Figma: 면접 랭킹 / to-be 의 상위 3명 카드 (1149:2365) */
function TopRankCard({
  rank,
  place
}: {
  rank: RankItem;
  place: number;
}): JSX.Element {
  return (
    <li className="flex flex-col gap-2 rounded-[20px] border border-border bg-bg-base px-5 py-4">
      <div className="flex items-center justify-between gap-2">
        <Badge appearance="weak" type="brand">
          {place}위
        </Badge>
        <Link
          href={`/members/${rank.id}`}
          className={buttonVariants({ variant: "secondary", size: "small" })}
        >
          프로필 보기
        </Link>
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <p className="truncate text-xl font-semibold text-text-primary md:text-2xl">
          {getNickname(rank)}
        </p>
        <p
          className={`text-2xl font-bold md:text-3xl ${
            place === 1 ? "text-primary" : "text-text-primary"
          }`}
        >
          {formatScore(rank.score)}
        </p>
      </div>
    </li>
  );
}

/** Figma: 면접 랭킹 / to-be 의 전체 랭킹 행 (1149:2393) */
function RankRow({
  rank,
  place
}: {
  rank: RankItem;
  place: number;
}): JSX.Element {
  return (
    <li>
      <Link
        href={`/members/${rank.id}`}
        className={`${rowClassName} transition-colors hover:bg-fill-quaternary`}
      >
        <span
          className={`${rankColumnClassName} text-lg font-semibold ${
            place <= 3 ? "text-primary" : "text-text-secondary"
          }`}
        >
          {place}
        </span>
        <span className="min-w-0 flex-1 truncate text-lg font-medium text-text-primary">
          {getNickname(rank)}
        </span>
        <span className="shrink-0 text-xl font-semibold whitespace-nowrap text-text-primary md:w-[254px]">
          {formatScore(rank.score)}
        </span>
      </Link>
    </li>
  );
}

export default function RankPage({
  rankList,
  topRank,
  userInfo
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  const router = useRouter();
  const { currentPage, totalPages, data } = rankList;

  // 페이지마다 getServerSideProps 가 다시 실행되어야 하므로 shallow 이동을 쓰지 않는다.
  const handlePageChange = (page: number): void => {
    router.push({
      pathname: router.pathname,
      query: page > 0 ? { page } : {}
    });
  };

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
        <div className="mx-auto flex w-full max-w-[1182px] flex-col gap-[50px] px-5 pt-8 pb-[100px] xl:px-0">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold text-text-primary">
                면접 랭킹
              </h1>
              <p className="text-lg text-text-secondary">
                꾸준히 쌓은 실력, 함께 성장하는 면접 연습.
              </p>
            </div>

            {topRank.length > 0 && (
              <section
                aria-label="상위 3명"
                className="flex flex-col items-center gap-5 lg:flex-row"
              >
                <div className="flex w-full max-w-[400px] items-center justify-center lg:max-w-none lg:flex-1 lg:px-[55px] lg:py-[47px]">
                  <Image
                    src="/rank/podium.png"
                    alt="1위, 2위, 3위 시상대에 선 꼬꼬면 캐릭터"
                    width={954}
                    height={813}
                    priority
                    sizes="(min-width: 1024px) 477px, 400px"
                    className="h-auto w-full"
                  />
                </div>
                <ol className="flex w-full flex-col gap-2 lg:flex-1">
                  {topRank.map((rank, index) => (
                    <TopRankCard key={rank.id} rank={rank} place={index + 1} />
                  ))}
                </ol>
              </section>
            )}
          </div>

          <section aria-label="전체 랭킹" className="flex flex-col gap-8">
            <div>
              <div
                className={`${rowClassName} border-b border-border text-sm font-medium text-text-secondary`}
              >
                <span className={rankColumnClassName}>순위</span>
                <span className="min-w-0 flex-1">닉네임</span>
                <span className="shrink-0 md:w-[254px]">점수</span>
              </div>
              {data.length > 0 ? (
                <ol className="divide-y divide-border border-b border-border">
                  {data.map((rank, index) => (
                    <RankRow
                      key={rank.id}
                      rank={rank}
                      place={currentPage * 10 + index + 1}
                    />
                  ))}
                </ol>
              ) : (
                <p className="border-b border-border p-12 text-center text-text-secondary">
                  아직 랭킹 데이터가 없습니다.
                </p>
              )}
            </div>

            {totalPages > 1 && (
              <Pagination
                className="self-center"
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </section>
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
