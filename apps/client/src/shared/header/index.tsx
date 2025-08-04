import { User } from "@/domains/auth/types";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  User as UserIcon,
  X
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { JSX, useEffect, useRef, useState } from "react";
import { Button } from "@kokomen/ui";
import { useLogout } from "@/hooks/useLogout";
import NotificationPanelIcon from "@/domains/notifications/components/notificationPanel";

interface HeaderProps {
  user: User | null;
}

type HeaderNavigation = { href: string; label: string; current: boolean };
const navigation: HeaderNavigation[] = [
  { href: "/", label: "홈", current: true },
  { href: "/interviews", label: "면접", current: false },
  { href: "/dashboard", label: "대시보드", current: false }
];

const DesktopProfileDropdown = ({ user }: HeaderProps) => {
  const { logout } = useLogout();
  const [isOpen, setIsOpen] = useState(false);
  const [desktopDropdownHeight, setDesktopDropdownHeight] = useState(0);
  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
    <div className="flex items-center space-x-3">
      <div className="hidden md:block relative">
        <Button
          onClick={handleUserClick}
          variant="primary"
          size="default"
          round
          className="w-10 h-10"
        >
          <UserIcon className="w-4 h-4 text-text-light-solid" />
        </Button>

        {/* 드롭다운 메뉴 */}
        <div
          className={`${isOpen ? "border" : "border-0"} absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border-gray-100 transition-all duration-200 overflow-hidden`}
          ref={desktopDropdownRef}
          style={{
            height: isOpen ? `${desktopDropdownHeight}px` : "0px"
          }}
        >
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">
              {user?.nickname}
            </p>
            {user ? (
              <p className="text-xs text-gray-500 mt-1">환영합니다!</p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">
                로그인 후 이용해주세요.
              </p>
            )}
          </div>
          <div className="py-1">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
            >
              <LayoutDashboard className="w-4 h-4" />
              대시보드
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
          </div>
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
  const router = useRouter();

  useEffect(() => {
    if (mobileMenuRef.current) {
      const height = mobileMenuRef.current.scrollHeight;
      setMenuHeight(height);
    }
  }, [isMobileMenuOpen]);

  return (
    <>
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
        aria-label="메뉴 열기"
      >
        {isMobileMenuOpen ? (
          <X className="w-5 h-5 text-gray-700" />
        ) : (
          <Menu className="w-5 h-5 text-gray-700" />
        )}
      </button>

      <div
        ref={mobileMenuRef}
        className={`md:hidden absolute top-16 left-0 w-full border-t border-gray-100 transition-all duration-300 ease-in-out bg-bg-base overflow-hidden`}
        style={{
          height: isMobileMenuOpen ? `${menuHeight}px` : "0px"
        }}
      >
        <nav className="flex flex-col space-y-2">
          {navigation.map((item) => {
            const isActive = router.pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? "text-blue-600 bg-blue-50 border border-blue-100"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
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
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-blue-600" />
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
                  name="login"
                  onClick={() => router.push("/login")}
                  className="flex items-center gap-3 w-full justify-start"
                  variant={"outline"}
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-blue-600" />
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
                  variant={"glass"}
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
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 md:flex justify-between items-center">
        <div className="flex justify-between items-center h-16 w-full">
          {/* 로고 */}
          <Link
            href="/"
            className="flex items-center group transition-transform duration-200 hover:scale-105"
          >
            <Image
              src="/logo.png"
              alt="꼬꼬면 로고"
              width={160}
              height={40}
              priority
              className="h-10 w-auto"
            />
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? "text-blue-600 bg-blue-50 border border-blue-100"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center space-x-2">
            <NotificationPanelIcon user={user} />
            <DesktopProfileDropdown user={user} />
            <MobileProfileDropdown user={user} />
          </div>
        </div>
      </div>
    </header>
  );
};

Header.displayName = "Header";

export default Header;
