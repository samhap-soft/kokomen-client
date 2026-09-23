import {
  LayoutDashboard,
  LogOut,
  Menu,
  User as UserIcon,
  X
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { JSX, useEffect, useRef, useState } from "react";
import { Button, Gnb, GnbMenuItem, GnbProfileButton } from "@kokomen/ui";
import { useLogout } from "@/hooks/useLogout";
import { UserInfo } from "@kokomen/types";
import useExtendedRouter from "@/hooks/useExtendedRouter";

interface HeaderProps {
  user: UserInfo | null;
}

type HeaderNavigation = {
  href: string;
  label: string;
  current: boolean;
  featureFlag: boolean;
};
// eslint-disable-next-line no-unused-vars
const navigation = (isAdmin: boolean | undefined): HeaderNavigation[] => {
  return [
    { href: "/", label: "홈", current: true, featureFlag: true },

    {
      href: "/interviews",
      label: "모의 면접",
      current: false,
      featureFlag: true
    },
    {
      href: "/rank",
      label: "랭킹",
      current: false,
      featureFlag: true
    },
    {
      href: "/dashboard",
      label: "마이페이지",
      current: false,
      featureFlag: true
    },
    {
      href: "/resume",
      label: "이력서",
      current: false,
      featureFlag: true
    },
    // {
    //   href: "/recruit",
    //   label: "채용 공고",
    //   current: false,
    //   featureFlag: true
    // },
    {
      href: "/purchase",
      label: "토큰 구매",
      current: false,
      featureFlag: true
    },
    ...(isAdmin
      ? [
          {
            href: "/admin",
            label: "관리자",
            current: false,
            featureFlag: true
          }
        ]
      : [])
  ];
};

const DesktopProfileDropdown = ({ user }: HeaderProps) => {
  const { logout } = useLogout();
  const [isOpen, setIsOpen] = useState(false);
  const [desktopDropdownHeight, setDesktopDropdownHeight] = useState(0);
  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const router = useExtendedRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        desktopDropdownRef.current &&
        !desktopDropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (desktopDropdownRef.current) {
      const height = desktopDropdownRef.current.scrollHeight;
      setDesktopDropdownHeight(height);
    } else {
      setDesktopDropdownHeight(0);
    }
  }, [isOpen]);

  const handleUserClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    if (!user) {
      router.push("/login");
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative">
      <GnbProfileButton onClick={handleUserClick} />

      {/* 드롭다운 메뉴. Figma GNB 명세에는 없는 앱 확장이다. */}
      <div
        className={`${isOpen ? "border" : "border-0"} absolute right-0 z-10 mt-2 w-56 overflow-hidden rounded-xl border-gray-100 bg-bg-base shadow-lg transition-all duration-200`}
        ref={desktopDropdownRef}
        style={{
          height: isOpen ? `${desktopDropdownHeight}px` : "0px"
        }}
      >
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-900">{user?.nickname}</p>
          {user ? (
            <p className="text-xs text-gray-500 mt-1">환영합니다!</p>
          ) : (
            <p className="text-xs text-gray-500 mt-1">로그인 후 이용해주세요.</p>
          )}
        </div>
        <div className="py-1">
          <Button
            variant="none"
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-text-primary hover:bg-primary-3 transition-colors duration-150 justify-start [&_svg]:size-4 rounded-none"
          >
            <LayoutDashboard className="w-4 h-4" />
            마이페이지
          </Button>
          <Button
            variant="none"
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-text-primary hover:bg-primary-3 transition-colors duration-150 justify-start [&_svg]:size-4 rounded-none"
          >
            <LogOut className="w-4 h-4" />
            로그아웃
          </Button>
        </div>
      </div>
    </div>
  );
};

const MobileProfileDropdown = ({ user }: HeaderProps) => {
  const { logout } = useLogout();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [menuHeight, setMenuHeight] = useState(0);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const router = useExtendedRouter();

  useEffect(() => {
    if (mobileMenuRef.current) {
      const height = mobileMenuRef.current.scrollHeight;
      setMenuHeight(height);
    }
  }, [isMobileMenuOpen]);

  return (
    <>
      <Button
        variant="none"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
        aria-label="메뉴 열기"
      >
        {isMobileMenuOpen ? (
          <X className="w-5 h-5 text-gray-700" />
        ) : (
          <Menu className="w-5 h-5 text-gray-700" />
        )}
      </Button>

      <div
        ref={mobileMenuRef}
        className={`md:hidden absolute top-16 left-0 w-full border-t border-gray-100 transition-all duration-300 ease-in-out bg-bg-base overflow-hidden`}
        style={{
          height: isMobileMenuOpen ? `${menuHeight}px` : "0px"
        }}
      >
        <nav className="flex flex-col space-y-2">
          {navigation(user?.is_admin || false).map((item) => {
            const isActive = router.pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? "text-primary bg-primary-bg-light border border-primary-border"
                    : "text-text-primary hover:bg-primary-bg-light"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}

          <div className="px-4 py-3 border-t border-gray-100 mt-4">
            <div className="flex items-center justify-between">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-bg-light rounded-full flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user?.nickname || "로그인"}
                    </p>
                    {user && (
                      <p className="text-xs text-gray-500">환영합니다!</p>
                    )}
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="none"
                  name="login"
                  onClick={() => router.navigateToLogin()}
                  className="flex items-center gap-3 w-full justify-start"
                >
                  <div className="w-8 h-8 bg-primary-bg-light rounded-full flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    로그인 후 이용해주세요.
                  </p>
                </Button>
              )}
              {user && (
                <Button
                  type="button"
                  onClick={logout}
                  name="logout"
                  variant={"primary-soft"}
                  className="[&_svg]:size-4"
                >
                  <LogOut className="w-4 h-4 text-gray-600" />
                </Button>
              )}
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

const Header = ({ user }: HeaderProps): JSX.Element => {
  const router = useExtendedRouter();

  return (
    <header className="sticky top-0 z-50">
      {/* PC: Figma Component/GNB (완) */}
      <div className="hidden px-4 pt-3 pb-1 md:block lg:px-8">
        <Gnb
          logo={
            <Link
              href="/"
              className="flex items-center transition-transform duration-200 hover:scale-105"
            >
              <Image
                src="/logo.svg"
                alt="꼬꼬면 로고"
                width={148}
                height={50}
                priority
                className="h-[50px] w-auto"
              />
            </Link>
          }
          profile={<DesktopProfileDropdown user={user} />}
        >
          {navigation(user?.is_admin || false).map((item) => {
            if (!item.featureFlag) return null;
            return (
              <GnbMenuItem
                key={item.href}
                as={Link}
                href={item.href}
                active={router.pathname === item.href}
              >
                {item.label}
              </GnbMenuItem>
            );
          })}
        </Gnb>
      </div>

      {/* 모바일: Figma 에 모바일 GNB 가 없어 기존 헤더를 유지한다 */}
      <div className="border-b border-border bg-bg-base/95 shadow-sm backdrop-blur-xl md:hidden">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center transition-transform duration-200 hover:scale-105"
          >
            <Image
              src="/logo.svg"
              alt="꼬꼬면 로고"
              width={160}
              height={40}
              priority
              className="h-10 w-auto"
            />
          </Link>
          <MobileProfileDropdown user={user} />
        </div>
      </div>
    </header>
  );
};

Header.displayName = "Header";

export default Header;
