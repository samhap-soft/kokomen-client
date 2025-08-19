import { JSX } from "react";
import Image from "next/image";
import { useIntersectionObserver } from "@kokomen/utils";

export const MockInterviewSection = (): JSX.Element => {
  const [sectionRef, isVisible] = useIntersectionObserver({
    threshold: 0.3,
    rootMargin: "0px 0px -50px 0px",
    triggerOnce: false
  });

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden p-8 sm:p-16 lg:p-32 flex flex-col justify-center items-center lg:flex-row bg-white"
    >
      <div
        className={`flex-1 text-center transition-all duration-1000 ease-out ${
          isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
        }`}
      >
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
          모의 면접을 통한 실전 연습
        </h2>
        <p className="mt-6 text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          양질의 면접 질문들을 통해 면접 실전 연습을 해나가요.
        </p>
      </div>
      <div
        className={`transition-all duration-1000 ease-out delay-300 ${
          isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
        }`}
      >
        <Image
          src="/screenshot.png"
          alt="모의 면접 화면"
          width={300}
          height={300}
          className="w-64 sm:w-80 lg:w-96 rounded-lg shadow-xl"
        />
      </div>
    </section>
  );
};
