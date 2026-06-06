import Header from "@/shared/header";
import Link from "next/link";
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
import { captureButtonEvent } from "@/utils/analytics";
import GuestInterviewModal from "@/domains/interview/components/guestInterviewModal";
import { useModal } from "@kokomen/utils";

export default function Home({
  user
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  const {
    isOpen: isGuestModalOpen,
    openModal: openGuestModal,
    closeModal: closeGuestModal
  } = useModal();

  return (
    <>
      <SEO robots="index, follow" pathname="/" />
      <main className="min-h-screen">
        <Header user={user} />

        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 sm:pt-20 lg:pt-32 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <h1 className="text-4xl sm:text-4xl lg:text-6xl font-bold text-gray-900 tracking-tight">
                <span className="block">혼자하는 취업준비,</span>
                <span className="block text-primary">이젠 끝내세요</span>
              </h1>
              <p className="mt-6 text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                현직 면접관 출신 개발자가 직접 설계한 질문과 꼬리질문으로,
                실전처럼 준비하세요.
              </p>

              {/* CTA Cards */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
                <Link
                  href="/resume"
                  onClick={() =>
                    captureButtonEvent({ name: "LandingResumeCTAClicked" })
                  }
                  className="flex-1 flex items-center gap-4 border border-border rounded-xl p-6 hover:border-primary hover:shadow-md transition-all duration-200 group"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Image
                      src="/icons/report.svg"
                      alt="이력서"
                      width={24}
                      height={24}
                    />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors">
                      이력서 및 포트폴리오 분석하기
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      서류 평가와 개선점을 받아보세요
                    </p>
                  </div>
                </Link>
                <Link
                  href="/interviews"
                  onClick={() =>
                    captureButtonEvent({ name: "LandingInterviewCTAClicked" })
                  }
                  className="flex-1 flex items-center gap-4 border border-border rounded-xl p-6 hover:border-primary hover:shadow-md transition-all duration-200 group"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Image
                      src="/icons/interview.svg"
                      alt="모의 면접"
                      width={24}
                      height={24}
                    />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors">
                      모의 면접 연습하기
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      꼬리질문으로 실전처럼 연습하세요
                    </p>
                  </div>
                </Link>
              </div>

              {/* Free Trial Button */}
              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => {
                    captureButtonEvent({ name: "LandingFreeTrialClicked" });
                    openGuestModal();
                  }}
                  className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-full text-white bg-primary hover:bg-primary-7 transition-colors duration-200 shadow-lg hover:shadow-xl cursor-pointer"
                >
                  무료로 체험하기
                </button>
                <p className="mt-2 text-sm text-gray-400">
                  회원가입 없이 바로 시작
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Value Proposition */}
        <section className="relative p-8 md:p-16 border-y border-border-secondary">
          <div className="mx-auto container">
            <h2 className="text-3xl font-bold">
              현직자가 직접 설계한 면접, 혼자 준비와는 달라요.
            </h2>
            <p className="text-xl text-text-placeholder mt-2">
              빅테크 면접관 출신 개발자들이 만든 질문과 난이도를 높이는
              꼬리질문으로 실전 감각을 키워보세요.
            </p>
          </div>
        </section>

        {/* STEP 1: Resume Evaluation Service */}
        <section className="relative overflow-hidden px-8 my-16 container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="flex flex-col gap-4">
              <span className="text-sm font-semibold text-primary tracking-wide">
                STEP 1. 서류 준비
              </span>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                이력서와 포트폴리오, 객관적으로 평가받으세요
              </h2>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                기술 역량, 프로젝트 경험, 문제 해결력, 성장 가능성, 문서 작성
                능력 등 5가지 핵심 항목을 점수화하여 개선 방향을 제시해드려요.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  기술 역량
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  프로젝트 경험
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  문제 해결력
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  성장 가능성
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  문서 작성 능력
                </li>
              </ul>
              <Link
                href="/resume"
                onClick={() =>
                  captureButtonEvent({ name: "LandingResumeStartClicked" })
                }
                className="mt-6 inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-lg text-white bg-primary hover:bg-primary-7 transition-colors duration-200 w-fit"
              >
                이력서 분석 시작하기
              </Link>
            </div>
            <div className="relative">
              <Image
                src="/landing/resume_landing.png"
                alt="이력서 평가 서비스 - 항목별 점수 차트"
                width={600}
                height={400}
                className="w-full rounded-xl shadow-lg"
              />
            </div>
          </div>
        </section>

        {/* STEP 2: Interview Features */}
        <section className="relative overflow-hidden px-8 my-16 justify-center items-center lg:flex-row container mx-auto gap-10 grid grid-cols-1">
          <span className="text-sm font-semibold text-primary tracking-wide">
            STEP 2. 실전 면접
          </span>
          <motion.div
            className="text-center transition-all duration-1000 ease-out mb-10 grid grid-cols-1 md:grid-cols-2 gap-10"
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
            className="text-center transition-all duration-1000 ease-out mb-10 grid grid-cols-1 md:grid-cols-2 gap-10"
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
            className="text-center transition-all duration-1000 ease-out mb-10 grid grid-cols-1 md:grid-cols-2 gap-10"
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            viewport={{ amount: 0.3 }}
          >
            <div className="flex flex-col items-center justify-center">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                현직 면접관이 직접 설계한 질문
              </h2>
              <p className="mt-3 text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                실제 빅테크 기업과 스타트업 면접관 출신 개발자들이 직접 작성한
                질문들로 구성되어 있어요. 꼬리질문을 통해 점점 깊어지는 난이도에
                대비하세요.
              </p>
            </div>
            <CompanyMarquee />
          </motion.div>
        </section>

        {/* Recommendations */}
        <section className="relative overflow-hidden px-8 my-16 justify-center items-center lg:flex-row container mx-auto gap-10">
          <Recommendations />
        </section>

        {/* Tech Field Cards */}
        <FeaturesCards />

        {/* Bottom CTA */}
        <section className="py-16 sm:py-20 bg-gradient-to-r from-primary-6 to-primary-7">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
              지금 바로 시작해보세요
            </h2>
            <p className="mt-4 text-base sm:text-lg text-blue-1 max-w-2xl mx-auto">
              꾸준한 면접 연습을 통해 소중한 기회를 잡아보세요
            </p>
            <div className="mt-8">
              <button
                type="button"
                onClick={() => {
                  captureButtonEvent({ name: "LandingBottomCTAClicked" });
                  openGuestModal();
                }}
                className="inline-flex items-center justify-center px-6 sm:px-8 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-full text-primary bg-white hover:bg-primary-hover transition-colors duration-200 shadow-lg hover:shadow-xl cursor-pointer"
              >
                무료로 체험하기
              </button>
            </div>
          </div>
        </section>

        <Footer />

        <GuestInterviewModal
          isOpen={isGuestModalOpen}
          onClose={closeGuestModal}
        />
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
