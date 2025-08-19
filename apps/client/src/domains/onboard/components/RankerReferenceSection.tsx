import { JSX } from "react";
import Image from "next/image";
import { useIntersectionObserver } from "@kokomen/utils";

export const RankerReferenceSection = (): JSX.Element => {
  const [sectionRef, isVisible] = useIntersectionObserver({
    threshold: 0.3,
    rootMargin: "0px 0px -50px 0px",
    triggerOnce: false
  });

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden p-8 sm:p-16 lg:p-32 flex flex-col justify-center items-center lg:flex-row-reverse bg-gray-50"
    >
      <div
        className={`flex-1 text-center transition-all duration-1000 ease-out ${
          isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
        }`}
      >
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
          랭커들의 면접 참고하기
        </h2>
        <p className="mt-6 text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          랭커들은 어떻게 답변했을까 참고하며 내 면접을 대비해 나가요.
        </p>
      </div>
      <div
        className={`transition-all duration-1000 ease-out delay-300 ${
          isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
        }`}
      >
        <Image
          src="/screenshot-members.png"
          alt="랭커 참고 화면"
          width={300}
          height={300}
          className="w-64 sm:w-80 lg:w-96 rounded-lg shadow-xl"
        />
      </div>
    </section>
  );
};
