import { NextRouter } from "next/router";

/** `?page=` 쿼리를 0 부터 시작하는 페이지 번호로 읽는다. 잘못된 값은 0 이다. */
export const getRouterPage = (router: NextRouter): number => {
  const page = Number(router.query.page);
  return Number.isInteger(page) && page > 0 ? page : 0;
};

/** 다른 쿼리(tab 등)는 그대로 두고 page 만 바꾼다. */
export const setRouterPage = (router: NextRouter, page: number): void => {
  const rest = { ...router.query };
  delete rest.page;
  router.replace(
    {
      pathname: router.pathname,
      query: page > 0 ? { ...rest, page } : rest
    },
    undefined,
    { shallow: true, scroll: false }
  );
};
