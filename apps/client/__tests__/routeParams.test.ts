import { parseNumericId, parsePageNumber } from "@/utils/routeParams";

describe("parseNumericId", () => {
  it("1 이상의 정수 문자열을 숫자로 변환한다", () => {
    expect(parseNumericId("1")).toBe(1);
    expect(parseNumericId("1234")).toBe(1234);
  });

  it("배열로 들어오면 첫 번째 값을 사용한다", () => {
    expect(parseNumericId(["7", "8"])).toBe(7);
  });

  it("숫자가 아닌 값은 null을 반환한다", () => {
    // 취약점 스캐너가 퍼징하는 형태들
    expect(parseNumericId("qyc5mncv4mby")).toBeNull();
    expect(parseNumericId("qyc5mncv4mby.php")).toBeNull();
    expect(parseNumericId("..\\..\\server-reference-manifest.json")).toBeNull();
    expect(parseNumericId("1 OR 1=1")).toBeNull();
    expect(parseNumericId("NaN")).toBeNull();
  });

  it("빈 값, 0, 음수, 소수, 안전 정수 범위를 벗어난 값은 null을 반환한다", () => {
    expect(parseNumericId(undefined)).toBeNull();
    expect(parseNumericId("")).toBeNull();
    expect(parseNumericId(" ")).toBeNull();
    expect(parseNumericId("0")).toBeNull();
    expect(parseNumericId("-1")).toBeNull();
    expect(parseNumericId("1.5")).toBeNull();
    expect(parseNumericId("0x10")).toBeNull();
    expect(parseNumericId("1e3")).toBeNull();
    expect(parseNumericId("9".repeat(30))).toBeNull();
  });
});

describe("parsePageNumber", () => {
  it("0 이상의 정수 문자열을 숫자로 변환한다", () => {
    expect(parsePageNumber("0")).toBe(0);
    expect(parsePageNumber("12")).toBe(12);
  });

  it("유효하지 않은 값은 fallback을 반환한다", () => {
    expect(parsePageNumber(undefined)).toBe(0);
    expect(parsePageNumber("")).toBe(0);
    expect(parsePageNumber("abc")).toBe(0);
    expect(parsePageNumber("-3")).toBe(0);
    expect(parsePageNumber("1.5")).toBe(0);
    expect(parsePageNumber("abc", 5)).toBe(5);
  });
});
