import { Marquee, MarqueeItem } from "@kokomen/ui";
import Image from "next/image";

const companies: { name: string; image: string }[] = [
  {
    name: "카카오 로고",
    image: "/company/kakao.svg"
  },
  { name: "토스 로고", image: "/company/toss.svg" },
  {
    name: "네이버 로고",
    image: "/company/naver.svg"
  },
  {
    name: "당근 로고",
    image: "/company/daanggn.svg"
  },
  {
    name: "쿠팡 로고",
    image: "/company/coupang.svg"
  },
  {
    name: "우아한형제들 로고",
    image: "/company/woowa.svg"
  }
];
export default function CompanyMarquee() {
  return (
    <Marquee className="relative h-full items-center" gap={50}>
      {companies.map((company) => (
        <MarqueeItem key={company.name}>
          <Image
            key={company.name}
            src={company.image}
            alt={company.name}
            width={150}
            height={100}
          />
        </MarqueeItem>
      ))}
    </Marquee>
  );
}
