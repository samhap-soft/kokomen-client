/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/typedef */
import { getCategories } from "@/api/category";
import { server } from "@/mocks";
import { http, HttpResponse } from "msw";
import type { GetServerSidePropsContext } from "next";

const CATEGORIES_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/categories`;

function contextWithCookies(
  cookies: Record<string, string>
): GetServerSidePropsContext {
  return { req: { cookies } } as unknown as GetServerSidePropsContext;
}

describe("카테고리 조회 API", () => {
  let sentCookie: string | null;

  beforeAll(() => server.listen());
  afterAll(() => server.close());

  beforeEach(() => {
    sentCookie = null;
    server.use(
      http.get(CATEGORIES_URL, ({ request }) => {
        sentCookie = request.headers.get("cookie");
        return HttpResponse.json([]);
      })
    );
  });

  afterEach(() => server.resetHandlers());

  it("회원이면 JSESSIONID 쿠키를 함께 보낸다", async () => {
    await getCategories(contextWithCookies({ JSESSIONID: "session-123" }));

    expect(sentCookie).toBe("JSESSIONID=session-123");
  });

  it("JSESSIONID 외 다른 쿠키는 보내지 않는다", async () => {
    await getCategories(
      contextWithCookies({
        JSESSIONID: "session-123",
        kokomen_guest_welcome_shown: "1"
      })
    );

    expect(sentCookie).toBe("JSESSIONID=session-123");
  });

  it("비회원이면 쿠키 없이 보낸다", async () => {
    await getCategories(contextWithCookies({}));

    expect(sentCookie).toBeNull();
  });

  it("context가 없어도 요청은 정상 동작한다", async () => {
    await getCategories();

    expect(sentCookie).toBeNull();
  });
});
