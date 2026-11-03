import { JSX } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRightIcon } from "@kokomen/ui";

const COMPANY_INFO_COLUMNS = [
  [
    { label: "상호명", value: "삼합소프트" },
    { label: "대표자", value: "조민형" },
    { label: "사업자번호", value: "281-01-02657" },
    { label: "전화번호", value: "010-3496-2045" }
  ],
  [
    { label: "개인정보책임", value: "조민형" },
    { label: "이메일", value: "samhapsoft@gmail.com" },
    { label: "사업장 주소", value: "서울특별시 동대문구 회기로 30" }
  ]
] as const;

const POLICY_LINKS = [
  { href: "/terms/termsofuse", label: "이용약관" },
  { href: "/terms/privacy", label: "개인정보 처리방침" }
] as const;

/** Figma: Component/Footer — 942:1387 */
export const Footer = (): JSX.Element => {
  return (
    <footer className="bg-bg-layout">
      <div className="mx-auto flex max-w-[1220px] flex-col gap-2 px-5 py-16 xl:px-0">
        {/* 배경이 투명한 로고에서 캐릭터를 잘라내고 "꼬꼬면" 글자만 보여준다 (Figma 942:1318) */}
        <div className="relative h-[50px] w-[84px] overflow-hidden">
          <Image
            src="/logo-transparent.png"
            alt="꼬꼬면"
            width={148}
            height={50}
            className="absolute top-0 left-[-53px] h-full w-auto max-w-none"
          />
        </div>
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-3">
          {COMPANY_INFO_COLUMNS.map((column, index) => (
            <dl key={index} className="flex flex-col gap-2 text-sm">
              {column.map((item) => (
                <div key={item.label} className="flex">
                  <dt className="w-20 shrink-0 text-text-tertiary">
                    {item.label}
                  </dt>
                  <dd className="text-text-secondary">{item.value}</dd>
                </div>
              ))}
            </dl>
          ))}
          <div className="flex flex-col gap-2 md:items-end md:pt-4">
            {POLICY_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-1 self-start text-sm text-primary transition-opacity hover:opacity-80 md:self-end"
              >
                {link.label}
                <ChevronRightIcon size={16} />
              </Link>
            ))}
          </div>
        </div>
        <p className="py-3 text-sm text-text-tertiary">
          © 2025 꼬꼬면. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
