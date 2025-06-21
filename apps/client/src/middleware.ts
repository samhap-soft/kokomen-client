import { NextConfig } from "next";
import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PATHS: Array<string> = ["/interviews", "/dashboard"];

const AUTH_PAGES: Array<string> = [];

// 경로 체크 함수들
function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((path) => pathname.startsWith(path));
}

function isAuthPage(pathname: string): boolean {
  return AUTH_PAGES.some((path) => pathname.startsWith(path));
}

// 로그인 URL 생성
function getLoginUrl(request: NextRequest): string {
  const loginUrl = new URL("/login", request.url);

  return loginUrl.toString();
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const sessionId = request.cookies.get("sessionid")?.value;
  if (isProtectedPath(pathname)) {
    if (!sessionId) {
      return NextResponse.redirect(new URL(getLoginUrl(request)));
    }

    return NextResponse.next();
  }
  if (isAuthPage(pathname)) {
    if (sessionId) {
      const redirectTo = request.nextUrl.searchParams.get("redirect") || "/";
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
  }
  return NextResponse.next();
}

export const config: NextConfig = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
