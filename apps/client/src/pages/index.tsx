import Header from "@/shared/header";
import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import { JSX } from "react";
import { getUserInfo } from "@/domains/auth/api";
import { isAxiosError } from "axios";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { SEO } from "@/shared/seo";
import {
  FeaturesCards,
  CompanyMarquee,
  Recommendations
} from "@/domains/landing/components";
import { Footer } from "@/shared/footer";
import { ArrowRightIcon } from "lucide-react";
import { motion } from "motion/react";
import { ErrorBoundary } from "@sentry/nextjs";

const Robot = dynamic(() => import("@/domains/landing/components/Robot"), {
  ssr: false
});

export default function Home({
  user
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  return (
    <>
      <SEO robots="index, follow" />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Header user={user} />
        <section className="relative overflow-hidden pt-16 sm:pt-20 lg:pt-32 bg-gradient-to-r from-blue-1 to-blue-4">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center "
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <h1
                className={`text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 tracking-tight transition-all duration-1000 ease-out `}
              >
                <span className="block">AI와 함께</span>
                <span className="block text-blue-6">면접 준비하기</span>
              </h1>
              <p
                className={`mt-6 text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed transition-all duration-1000 ease-out delay-200 `}
              >
                체계적인 학습과 실전 연습으로 기술 면접을 완벽하게 준비하세요.
              </p>
              <div
                className={`mt-10 flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 ease-out delay-400 `}
              >
                <Link
                  href="/interviews"
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-full text-white bg-blue-6 hover:bg-blue-7 transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  면접 연습 시작하기
                  <ArrowRightIcon className="ml-4" />
                </Link>
              </div>
              <div className="w-full h-full">
                <ErrorBoundary
                  fallback={
                    <div className="md:h-[1000px] h-[500px] w-full bg-transparent" />
                  }
                >
                  <Robot />
                </ErrorBoundary>
              </div>
            </motion.div>
          </div>
        </section>
        <section className="relative p-8 md:p-16 border-y border-border-secondary">
          <div className=" mx-auto container">
            <h1 className="text-3xl font-bold">
              혼자서 하는 면접 연습과는 달라요.
            </h1>
            <p className="text-3xl text-text-placeholder">
              내 생각을 글로 정리하거나, 말로 풀어내는 연습은 꼭 필요해요.
            </p>
          </div>
        </section>
        <section className="relative overflow-hidden px-8 my-16 justify-center items-center lg:flex-row container mx-auto gap-10 grid grid-cols-1">
          <motion.div
            className={`text-center transition-all duration-1000 ease-out mb-10 grid grid-cols-1 md:grid-cols-2 gap-10 `}
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <div className="flex flex-col items-center justify-center">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                텍스트 뿐만 아니라 구두로도 연습해보세요.
              </h2>
              <p className="mt-3 text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                면접관과 이야기하는 것처럼 최적의 환경을 제공해드려요.
              </p>
            </div>
            <Image
              src="/screenshot.png"
              alt="모의 면접 화면"
              width={700}
              height={400}
              className="w-full rounded-lg shadow-xl"
            />
          </motion.div>
          <motion.div
            className={`text-center transition-all duration-1000 ease-out mb-10 grid grid-cols-1 md:grid-cols-2 gap-10`}
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <div className="flex flex-col items-center justify-center">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                다른 사용자의 우수 답변을 참고해보세요.
              </h2>
              <p className="mt-3 text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                다른 사용자의 면접을 보고 어떻게 보완해나갈지 생각해보세요.
              </p>
            </div>
            <Image
              src="/screenshot-members.png"
              alt="랭커 참고 화면"
              width={700}
              height={600}
              className="w-full rounded-lg shadow-xl"
            />
          </motion.div>
          <motion.div
            className={`text-center transition-all duration-1000 ease-out mb-10 grid grid-cols-1 md:grid-cols-2 gap-10`}
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            viewport={{ amount: 0.3 }}
          >
            <div className="flex flex-col items-center justify-center">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                면접질문의 질도 중요해요
              </h2>
              <p className="mt-3 text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                실제 팀원들이 빅테크 기업과 스타트업 등에서 들었던 면접 질문들과
                면접관 출신 개발자분들이 직접 내신 질문, 유명한 빈출 질문들을
                직접 엄선해서 제공해드려요.
              </p>
            </div>
            <CompanyMarquee />
          </motion.div>
        </section>
        <section className="relative overflow-hidden px-8 my-16 justify-center items-center lg:flex-row container mx-auto gap-10">
          <Recommendations />
        </section>
        <FeaturesCards />
        <section className="py-16 sm:py-20 bg-gradient-to-r from-blue-6 to-blue-7">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2
              className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-white transition-all duration-1000 ease-out`}
            >
              지금 바로 시작해보세요
            </h2>
            <p
              className={`mt-4 text-base sm:text-lg text-blue-1 max-w-2xl mx-auto transition-all duration-1000 ease-out delay-200`}
            >
              꾸준한 면접 연습을 통해 소중한 기회를 잡아보세요
            </p>
            <div
              className={`mt-8 transition-all duration-1000 ease-out delay-400`}
            >
              <Link
                href="/interviews"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-full text-blue-6 bg-white hover:bg-gray-50 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                무료로 시작하기
              </Link>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const { data: user } = await getUserInfo(context);
    return {
      props: {
        user
      }
    };
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 401) {
      return {
        props: {
          user: null
        }
      };
    }
    return {
      redirect: {
        destination: "/error",
        permanent: false
      }
    };
  }
};
