import { JSX } from "react";
import { useIntersectionObserver } from "@kokomen/utils";

interface TechField {
  name: string;
  stacks: string[];
}

const fields: TechField[] = [
  { name: "프론트엔드", stacks: ["브라우저", "렌더링", "웹 성능", "접근성"] },
  { name: "리액트", stacks: ["Hook", "상태관리", "SSR", "RSC"] },
  { name: "JS / TS", stacks: ["이벤트루프", "클로저", "타입시스템", "비동기"] },
  { name: "자바 / 스프링", stacks: ["Spring Boot", "JPA", "DI", "AOP"] },
  { name: "데이터베이스", stacks: ["SQL", "인덱스", "정규화", "트랜잭션"] },
  { name: "네트워크", stacks: ["TCP/IP", "HTTP", "DNS", "TLS"] },
  { name: "운영체제", stacks: ["프로세스", "메모리", "스케줄링", "동기화"] },
  { name: "인프라", stacks: ["Docker", "Redis", "Kafka", "CI/CD"] },
  {
    name: "알고리즘 / 자료구조",
    stacks: ["정렬", "그래프", "DP", "해시"]
  }
];

const FeaturesCards = (): JSX.Element => {
  const [sectionRef, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: "0px 0px -100px 0px",
    triggerOnce: false
  });

  return (
    <section
      ref={sectionRef}
      className="py-20 sm:py-28 relative overflow-hidden bg-gray-50"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-14 transition-all duration-700 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            면접에 필요한 모든 기술 영역
          </h2>
          <p className="mt-3 text-lg text-gray-500">
            9개 분야, 500개 이상의 실전 질문
          </p>
        </div>

        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-700 ease-out delay-100 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {fields.map((field) => (
            <div
              key={field.name}
              className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-sm hover:border-gray-300 transition-all"
            >
              <p className="font-semibold text-gray-900 mb-2.5">{field.name}</p>
              <div className="flex flex-wrap gap-1.5">
                {field.stacks.map((stack) => (
                  <span
                    key={stack}
                    className="text-xs text-gray-500 bg-gray-100 rounded-md px-2 py-0.5"
                  >
                    {stack}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesCards;
