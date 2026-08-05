import { JSX, ReactNode } from "react";

/**
 * react-markdown 테스트 스텁.
 *
 * react-markdown(및 remark/micromark 체인)은 ESM 전용인데, Yarn PnP에서는
 * 패키지 경로가 `.yarn/cache/*.zip/node_modules/...` 형태라
 * jest의 transformIgnorePatterns(/node_modules/)에 걸려 변환되지 않는다.
 * 그 결과 CJS 런타임이 `export`를 만나 SyntaxError로 스위트 전체가 죽는다.
 *
 * 마크다운 렌더링 자체는 테스트 대상이 아니므로, 원문을 그대로 출력해
 * 텍스트 기반 단정(assertion)이 유지되도록만 한다.
 */
export default function Markdown({
  children
}: {
  children?: ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}): JSX.Element {
  return <div data-testid="markdown-stub">{children}</div>;
}
