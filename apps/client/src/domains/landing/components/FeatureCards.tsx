import { JSX } from "react";
import Image from "next/image";
import { useIntersectionObserver } from "@kokomen/utils";

interface Feature {
  id: number;
  title: string;
  description: string;
  image: string;
  color: string;
}

interface FeatureCardProps {
  feature: Feature;
  index: number;
  isVisible: boolean;
}

const FeatureCard = ({ feature, index, isVisible }: FeatureCardProps) => {
  return (
    <div
      className={`flex-1 rounded-2xl p-4 sm:p-6 transition-all cursor-pointer duration-1000 ease-out overflow-hidden group ${feature.color} ${
        index % 2 === 0 ? "animate-float" : "animate-float-reverse"
      } ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
      style={{
        animationDelay: `${index * 200}ms`
      }}
    >
      {/* 이미지 영역 */}
      <div className="w-full h-full flex items-center justify-center mb-3">
        <Image
          src={feature.image}
          alt={feature.title}
          width={80}
          height={80}
          className="w-full object-contain transition-transform duration-300 group-hover:scale-110"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/95 to-gray-100/95 rounded-2xl p-4 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
          {feature.title}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed text-center">
          {feature.description}
        </p>
      </div>
    </div>
  );
};

const features: Feature[] = [
  {
    id: 1,
    title: "프론트엔드",
    description: "JS, TS, React, Next.js 기반의 실무 중심의 깊은 기술적 지식",
    image: "/card-frontend.svg",
    color: "bg-blue-4"
  },
  {
    id: 2,
    title: "백엔드",
    description:
      "Java, Spring, 데이터베이스 기반의 실무 중심의 깊은 기술적 지식",
    image: "/card-backend.svg",
    color: "bg-green-4"
  },
  {
    id: 3,
    title: "네트워크",
    description:
      "TCP, UDP, HTTP, HTTPS, DNS, 네트워크 보안 등 실무 중심의 깊은 기술적 지식",
    image: "/card-network.svg",
    color: "bg-yellow-4"
  },
  {
    id: 4,
    title: "운영체제",
    description:
      "프로세스, 스레드, 메모리 관리부터 시작해서 디스크 관리까지 실무 중심의 깊은 기술적 지식",
    image: "/card-os.svg",
    color: "bg-red-4"
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
      className="py-16 sm:py-20 bg-white relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-16 transition-all duration-1000 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            다양한 기술 분야
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            프론트엔드, 백엔드에 국한하지 않고 각종 Computer Science를 포함하여
            인프라 등 여러 분야의 문제들이 준비되어 있어요.
          </p>
        </div>

        <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px] rounded-2xl flex-col sm:flex-row gap-4 hidden lg:flex">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>

        {/* 모바일용 그리드 레이아웃 */}
        <div className="grid grid-cols-2 gap-4 mt-8 lg:hidden">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className={`aspect-square rounded-2xl p-4 transition-all cursor-pointer duration-1000 ease-out overflow-hidden group ${feature.color} ${
                index % 2 === 0 ? "animate-float" : "animate-float-reverse"
              } ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
              style={{
                animationDelay: `${index * 200}ms`
              }}
            >
              <div className="w-full h-full flex flex-col items-center justify-center">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  width={60}
                  height={60}
                  className="w-28 h-28 object-contain transition-transform duration-300 group-hover:scale-110 mb-3"
                />
                <h3 className="text-sm font-semibold text-gray-900 text-center">
                  {feature.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesCards;
