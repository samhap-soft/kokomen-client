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

type Paginated<T> = {
  data: T;
  current_page: number;
  total_pages: number;
  has_next: boolean;
};

export type { CamelCasedProperties, Paginated };
