import { JSX } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { useIntersectionObserver } from "@kokomen/utils";

export const HeroSection = (): JSX.Element => {
  const [sectionRef, isVisible] = useIntersectionObserver({
    threshold: 0.3,
    rootMargin: "0px 0px -50px 0px",
    triggerOnce: true
  });

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-16 sm:py-20 lg:py-32 bg-gradient-to-r from-blue-1 to-blue-4"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1
            className={`text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 tracking-tight transition-all duration-1000 ease-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <span className="block">똑똑하게</span>
            <span className="block text-blue-6">면접 준비하기</span>
          </h1>
          <p
            className={`mt-6 text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed transition-all duration-1000 ease-out delay-200 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            체계적인 학습과 실전 연습으로 기술 면접을 완벽하게 준비하세요.
          </p>
          <div
            className={`mt-10 flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 ease-out delay-400 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <Link
              href="/interviews"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-full text-white bg-blue-6 hover:bg-blue-7 transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              면접 연습 시작하기
              <ArrowRightIcon className="ml-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
