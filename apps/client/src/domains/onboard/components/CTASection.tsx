import { JSX } from "react";
import Link from "next/link";
import { useIntersectionObserver } from "@kokomen/utils";

export const CTASection = (): JSX.Element => {
  const [sectionRef, isVisible] = useIntersectionObserver({
    threshold: 0.3,
    rootMargin: "0px 0px -50px 0px",
    triggerOnce: true
  });

  return (
    <section
      ref={sectionRef}
      className="py-16 sm:py-20 bg-gradient-to-r from-blue-6 to-blue-7"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2
          className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-white transition-all duration-1000 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          지금 바로 시작해보세요
        </h2>
        <p
          className={`mt-4 text-base sm:text-lg text-blue-1 max-w-2xl mx-auto transition-all duration-1000 ease-out delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          꾸준한 면접 연습을 통해 소중한 기회를 잡아보세요
        </p>
        <div
          className={`mt-8 transition-all duration-1000 ease-out delay-400 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
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
  );
};
