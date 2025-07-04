import { Category, getCategories } from "@/api/category";
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  InferGetServerSidePropsType,
} from "next";
import { Button } from "@kokomen/ui/components/button";
import { JSX, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Header from "@/shared/header";

import { withCheckInServer } from "@/utils/auth";
import { Trophy, Coins, User as UserIcon, Star, Zap } from "lucide-react";
import { getUserInfo } from "@/domains/auth/api";
import { User as UserType } from "@/domains/auth/types";
import CreateInterviewForm from "@/domains/interview/components/createInterviewForm";

export default function InterviewMainPage({
  categories,
  userInfo,
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  const [selectedCategory, setSelectedCategory] = useState<Category>(
    categories[0]
  );

  return (
    <>
      <Head>
        <title>꼬꼬면 - 면접 연습 플랫폼</title>
        <meta
          name="description"
          content="운영체제, 데이터베이스, 자료구조, 알고리즘 면접 연습"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen bg-bg-layout">
        <Header user={userInfo} />
        <main className="flex flex-col-reverse lg:flex-row lg:items-start mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 gap-8">
          <section className="w-full lg:flex-1 lg:min-w-0 flex flex-col">
            {/* 카테고리 탭 */}
            <nav className="w-full mb-8">
              <div className="bg-bg-elevated rounded-2xl p-2 shadow-lg border border-border">
                <div className="flex overflow-x-auto gap-1 p-2">
                  {categories.map((category) => (
                    <Button
                      type="button"
                      key={category.key}
                      role="tab"
                      className="text-sm font-semibold"
                      aria-selected={selectedCategory.key === category.key}
                      variant={
                        selectedCategory.key === category.key
                          ? "primary"
                          : "text"
                      }
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category.title}
                    </Button>
                  ))}
                </div>
              </div>
            </nav>

            {/* 메인 컨텐츠 */}
            <div className="bg-bg-elevated rounded-3xl border border-border shadow-2xl overflow-hidden">
              <div className="p-8 lg:p-12">
                {/* 헤더 섹션 */}
                <div className="text-center mb-12">
                  <div className="relative inline-block mb-6">
                    <Image
                      src={selectedCategory.image_url}
                      alt={selectedCategory.title}
                      width={200}
                      height={200}
                      priority
                      className="w-52 h-auto"
                    />
                  </div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-text-heading mb-4">
                    {selectedCategory.title}
                  </h1>
                  <p className="text-lg text-text-description leading-relaxed max-w-2xl mx-auto">
                    {selectedCategory.description}
                  </p>
                </div>

                <CreateInterviewForm selectedCategory={selectedCategory} />
              </div>
            </div>
          </section>

          <aside className="w-full lg:w-96">
            <div className="bg-bg-elevated rounded-3xl border border-border shadow-2xl overflow-hidden">
              {/* 헤더 섹션 */}
              <div className="bg-primary p-6 text-text-light-solid relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-bg rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-bg rounded-full translate-y-12 -translate-x-12 opacity-10"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-primary-bg rounded-full flex items-center justify-center border-2 border-primary-border">
                        <UserIcon className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">
                        {userInfo?.nickname || "사용자"}
                      </h3>
                      <p className="text-primary-bg text-sm flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        오늘도 화이팅!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 통계 섹션 */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="group relative bg-gold-1 rounded-xl p-4 border border-gold-3 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gold-6 rounded-lg flex items-center justify-center shadow-sm">
                        <Trophy className="w-5 h-5 text-text-light-solid" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gold-8 mb-1">
                          총 점수
                        </p>
                        <p className="text-xl font-bold text-gold-9">
                          {userInfo?.score || 0}
                        </p>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Star className="w-4 h-4 text-gold-6" />
                    </div>
                  </div>

                  <div className="group relative bg-green-1 rounded-xl p-4 border border-green-3 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-6 rounded-lg flex items-center justify-center shadow-sm">
                        <Coins className="w-5 h-5 text-text-light-solid" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-green-8 mb-1">
                          남은 토큰
                        </p>
                        <p className="text-xl font-bold text-green-9">
                          {userInfo?.token_count || 0}
                        </p>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-4 h-4 bg-green-6 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </>
  );
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
): Promise<
  GetServerSidePropsResult<{
    categories: Category[];
    userInfo: UserType | null;
  }>
> => {
  return withCheckInServer<{
    categories: Category[];
    userInfo: UserType | null;
  }>(
    async () => {
      const [categoriesResponse, userInfoResponse] = await Promise.all([
        getCategories(),
        getUserInfo(context),
      ]);

      const categoryData = categoriesResponse.data;
      const userInfoData = userInfoResponse.data;

      return {
        data: { categories: categoryData, userInfo: userInfoData },
      } as any;
    },
    {
      onError: () => {
        return {
          redirect: {
            destination: "/500",
            permanent: false,
          },
        };
      },
    }
  );
};
