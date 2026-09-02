// 라우트 파라미터와 쿼리 스트링은 임의의 문자열로 들어올 수 있다.
// 취약점 스캐너가 `/members/qyc5mncv4mby` 같은 경로를 퍼징하면 `Number()`가 NaN을 만들고,
// 그 NaN이 그대로 API 쿼리에 실려 백엔드에서 타입 변환 에러(500)를 발생시킨다.
// 따라서 API 호출 전에 숫자로 쓸 수 있는 값만 통과시킨다.

const DIGITS_ONLY: RegExp = /^\d+$/;

const firstValue = (
  value: string | string[] | undefined
): string | undefined => (Array.isArray(value) ? value[0] : value);

/**
 * 1 이상의 정수 ID만 통과시킨다. 그 외(비숫자, 음수, 소수, 안전 범위 초과)는 null.
 * null이면 API를 호출하지 않고 `notFound: true`를 반환하는 데 사용한다.
 */
export const parseNumericId = (
  value: string | string[] | undefined
): number | null => {
  const raw = firstValue(value);
  if (typeof raw !== "string" || !DIGITS_ONLY.test(raw)) {
    return null;
  }
  const parsed = Number(raw);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
};

/**
 * 0 이상의 정수 페이지 번호만 통과시키고, 유효하지 않으면 fallback을 사용한다.
 * 페이지는 잘못된 값이 와도 첫 페이지를 보여주면 되므로 404로 처리하지 않는다.
 */
export const parsePageNumber = (
  value: string | string[] | undefined,
  fallback: number = 0
): number => {
  const raw = firstValue(value);
  if (typeof raw !== "string" || !DIGITS_ONLY.test(raw)) {
    return fallback;
  }
  const parsed = Number(raw);
  return Number.isSafeInteger(parsed) ? parsed : fallback;
};
