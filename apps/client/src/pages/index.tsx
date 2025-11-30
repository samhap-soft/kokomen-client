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
import { motion } from "motion/react";
import { ErrorBoundary } from "@sentry/nextjs";
import { Tooltip } from "@kokomen/ui";

const Robot = dynamic(() => import("@/domains/landing/components/Robot"), {
  ssr: false
});

const links = [
  {
    title: "모의 면접",
    description: "꼬리에 꼬리를 무는 면접으로 연습해보세요.",
    href: "/interviews",
    icon: "/icons/interview.svg"
  },
  {
    title: "이력서",
    description:
      "이력서와 포트폴리오를 평가하고 개선점을 제안하고, 이력서 기반 면접을 진행해보세요.",
    href: "/resume",
    icon: "/icons/report.svg"
  }
];

export default function Home({
  user
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  return (
    <>
      <SEO robots="index, follow" pathname="/" />
      <main className="min-h-screen">
        <Header user={user} />
        <section className="relative overflow-hidden pt-16 sm:pt-20 lg:pt-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center "
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <h1
                className={`text-4xl sm:text-4xl lg:text-6xl font-bold text-gray-900 tracking-tight transition-all duration-1000 ease-out `}
              >
                <span className="block">똑똑하게</span>
                <span className="block text-primary">취업 준비하기</span>
              </h1>
              <p
                className={`mt-6 text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed transition-all duration-1000 ease-out delay-200 `}
              >
                취업 준비에 필요한 시간들을 꼬꼬면과 함께 효율적으로
                사용해보세요.
              </p>
              <div className={`mt-10 flex gap-4 justify-center`}>
                {links.map((link) => (
                  <Tooltip
                    key={link.href}
                    className="relative flex flex-col items-center justify-center gap-2"
                  >
                    <Link
                      href={link.href}
                      className="border border-border rounded-lg p-4 flex items-center justify-center w-16 h-16"
                    >
                      <Image
                        src={link.icon}
                        alt={link.title}
                        width={20}
                        height={20}
                        className="w-full h-full object-contain"
                      />
                    </Link>
                    <p className="font-bold text-sm">{link.title}</p>
                    <Tooltip.Content placement="top">
                      <p className="text-sm">{link.description}</p>
                    </Tooltip.Content>
                  </Tooltip>
                ))}
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
        <section className="py-16 sm:py-20 bg-gradient-to-r from-primary-6 to-primary-7">
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
                className="inline-flex items-center justify-center px-6 sm:px-8 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-full text-primary bg-white hover:bg-primary-hover transition-colors duration-200 shadow-lg hover:shadow-xl"
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
    console.log(error);
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
