import { NextConfig } from "next";

import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PATHS: Array<string> = ["/dashboard", "/admin", "/onboarding"];

// 경로 체크 함수들
function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((path) => pathname.startsWith(path));
}

// 로그인 URL 생성
function getLoginUrl(request: NextRequest): string {
  const loginUrl = new URL(
    `/login?redirectTo=${request.nextUrl.pathname}`,
    process.env.NEXT_PUBLIC_BASE_URL
  );

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

  const sessionId = request.cookies.get("JSESSIONID")?.value;

  if (isProtectedPath(pathname)) {
    if (!sessionId) {
      return NextResponse.redirect(new URL(getLoginUrl(request)));
    }

    // TODO: admin 전용 체크 (서버에서 is_admin API 구현 후 활성화)
    // if (pathname.startsWith("/admin")) {
    //   const isAdmin = await checkIsAdmin(sessionId);
    //   if (!isAdmin) {
    //     return NextResponse.redirect(new URL("/dashboard", request.url));
    //   }
    // }

    return NextResponse.next();
  }
  return NextResponse.next();
}

export const config: NextConfig = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"]
};
