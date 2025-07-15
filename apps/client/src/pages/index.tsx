import { JSX } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/shared/header";
import { getUserInfo } from "@/domains/auth/api";
import { isAxiosError } from "axios";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { SEO } from "@/shared/seo";

const features: { title: string; description: string; icon: string }[] = [
  {
    title: "운영체제",
    description: "프로세스, 스레드, 메모리 관리 등 핵심 개념을 체계적으로 학습",
    icon: "💻",
  },
  {
    title: "데이터베이스",
    description: "SQL, NoSQL, 트랜잭션, 인덱싱 등 실무 중심의 문제들",
    icon: "🗄️",
  },
  {
    title: "자료구조",
    description: "배열, 링크드리스트, 트리, 그래프 등 기본기 다지기",
    icon: "📊",
  },
  {
    title: "알고리즘",
    description: "정렬, 탐색, 동적계획법 등 문제 해결 능력 향상",
    icon: "🧮",
  },
];

export default function Home({
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  return (
    <>
      <SEO />

      <main
        className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50`}
      >
        <Header user={user} />
        <section className="relative overflow-hidden py-20 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 tracking-tight">
                <span className="block">면접 준비의</span>
                <span className="block text-blue-600">새로운 기준</span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                체계적인 학습과 실전 연습으로 기술 면접을 완벽하게 준비하세요.
                운영체제부터 알고리즘까지, 모든 것을 한 곳에서.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/interviews"
                  className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  면접 연습 시작하기
                  <svg
                    className="ml-2 -mr-1 w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                핵심 기술 영역별 체계적 학습
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                실제 면접에서 자주 출제되는 문제들을 중심으로 구성했습니다
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="relative group bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              지금 바로 시작해보세요
            </h2>
            <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto">
              체계적인 면접 준비로 꿈의 회사에 한 걸음 더 가까워지세요
            </p>
            <div className="mt-8">
              <Link
                href="/interviews"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-blue-600 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                무료로 시작하기
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-bg-layout py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <Image
                src="/logo.png"
                alt="꼬꼬면"
                width={120}
                height={30}
                className="mx-auto mb-4 opacity-80"
              />
              <p className="text-gray-400">
                © 2025 꼬꼬면. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const { data: user } = await getUserInfo(context);
    return {
      props: {
        user,
      },
    };
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 401) {
      return {
        props: {
          user: null,
        },
      };
    }
    return {
      redirect: {
        destination: "/error",
        permanent: false,
      },
    };
  }
};
