import { serverInstance } from "@/api";
import { AxiosPromise } from "axios";
import { GetServerSidePropsContext } from "next";

type Category = {
  key: string;
  title: string;
  description: string;
  image_url: string;
};

/**
 * 카테고리 목록 조회.
 * context를 넘기면 회원(JSESSIONID 보유)일 때 세션 쿠키를 함께 보낸다.
 * 비회원이면 쿠키 없이 그대로 요청한다.
 */
const getCategories = async (
  context?: GetServerSidePropsContext
): AxiosPromise<Category[]> => {
  const sessionId = context?.req.cookies.JSESSIONID;

  return serverInstance.get<Category[]>(
    "/categories",
    sessionId ? { headers: { Cookie: `JSESSIONID=${sessionId}` } } : undefined
  );
};

export { getCategories };
export type { Category };
