/* eslint-disable @typescript-eslint/no-explicit-any */

type CamelCase<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<CamelCase<U>>}`
  : S;

type CamelCasedProperties<T> = {
  [K in keyof T as K extends string ? CamelCase<K> : K]: T[K] extends object
    ? T[K] extends Array<any>
      ? CamelCasedProperties<T[K][number]>[] // 배열 -> 재귀 처리 해줘야함
      : CamelCasedProperties<T[K]> // 객체 -> 재귀 처리 해줘야함
    : T[K]; // 기본 타입 -> 그대로 반환
};

export function mapToCamelCase<T extends object>(
  obj: T
): CamelCasedProperties<T> {
  // 배열이면 재귀 처리
  if (Array.isArray(obj)) {
    return obj.map((item) => mapToCamelCase(item)) as CamelCasedProperties<T>;
  }

  // 객체면 키를 카멜케이스로 변환해서 리턴
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
      letter.toUpperCase()
    );

    const value = (obj as any)[key];

    acc[camelKey] =
      typeof value === "object" && value !== null
        ? mapToCamelCase(value)
        : value;
    return acc;
  }, {} as any) as CamelCasedProperties<T>;
}

export type { CamelCasedProperties };
