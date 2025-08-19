import { JSX } from "react";
import Image from "next/image";
import { useIntersectionObserver } from "@kokomen/utils";

export const Footer = (): JSX.Element => {
  const [sectionRef, isVisible] = useIntersectionObserver({
    threshold: 0.3,
    rootMargin: "0px 0px -50px 0px",
    triggerOnce: true
  });

  return (
    <footer ref={sectionRef} className="bg-bg-layout py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center transition-all duration-1000 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Image
            src="/logo.png"
            alt="꼬꼬면"
            width={120}
            height={30}
            className="mx-auto mb-4 opacity-80"
          />
          <p className="text-gray-400">© 2025 꼬꼬면. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
