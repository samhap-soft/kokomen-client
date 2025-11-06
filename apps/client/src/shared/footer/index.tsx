import { JSX } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const Footer = (): JSX.Element => {
  return (
    <footer className="bg-bg-layout">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div>
          <Image
            src="/logo.png"
            alt="꼬꼬면"
            width={140}
            height={35}
            className="mb-8 hover:opacity-90 transition-opacity"
          />
          {/* 중간 섹션 - 회사 정보와 링크 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* 회사 정보 */}
            <div className="md:col-span-2">
              <h3 className="text-text-primary font-semibold mb-4 text-base">
                회사 정보
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-400">
                <div className="space-y-2">
                  <p className="flex">
                    <span className="text-text-secondary min-w-[100px]">
                      상호명
                    </span>
                    <span className="ml-4">삼합소프트</span>
                  </p>
                  <p className="flex">
                    <span className="text-text-secondary min-w-[100px]">
                      대표자
                    </span>
                    <span className="ml-4">조민형</span>
                  </p>
                  <p className="flex">
                    <span className="text-text-secondary min-w-[100px]">
                      사업자번호
                    </span>
                    <span className="ml-4">281-01-02657</span>
                  </p>
                  <p className="flex">
                    <span className="text-text-secondary min-w-[100px]">
                      전화번호
                    </span>
                    <span className="ml-4">010-3496-2045</span>
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="flex">
                    <span className="text-text-secondary min-w-[100px]">
                      개인정보책임
                    </span>
                    <span className="ml-4">조민형</span>
                  </p>
                  <p className="flex">
                    <span className="text-text-secondary min-w-[100px]">
                      이메일
                    </span>
                    <span className="ml-4 hover:text-gray-300 transition-colors">
                      samhapsoft@gmail.com
                    </span>
                  </p>
                  <p className="flex">
                    <span className="text-text-secondary min-w-[100px]">
                      사업장 주소
                    </span>
                    <span className="ml-4">서울특별시 동대문구 회기로 30</span>
                  </p>
                </div>
              </div>
            </div>

            {/* 약관 링크 */}
            <div className="md:text-right">
              <h3 className="text-text-primary font-semibold mb-4 text-base">
                약관 및 정책
              </h3>
              <div className="flex flex-col space-y-2 md:items-end">
                <Link
                  href="/terms/termsofuse"
                  className="text-sm text-primary transition-colors duration-200 inline-flex items-center group"
                >
                  이용약관
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/terms/privacy"
                  className="text-sm text-primary transition-colors duration-200 inline-flex items-center group"
                >
                  개인정보 처리방침
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* 하단 섹션 - 저작권 */}
          <div className="pt-8 border-border border-t text-center flex flex-col items-center">
            <p className="text-gray-500 text-sm">
              © 2025 꼬꼬면. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
