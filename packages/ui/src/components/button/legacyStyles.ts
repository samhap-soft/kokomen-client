/**
 * Figma 동기화(#221, #222) 이전에 `Button` 이 갖고 있던 variant 중 Figma 명세에
 * 없어 제거된 것들의 모양을 className 으로 복원한다.
 *
 * Figma 의 Common/Button (완) 옵션 테이블은 variant 를
 * primary · secondary · danger · primary-soft 4종으로만 정의한다. 그래서
 * 컴포넌트의 `variant` 는 4종으로 유지하고, 명세 밖 모양이 필요한 기존 화면은
 * `variant="none"` + 아래 프리셋으로 이전 모양을 그대로 쓴다.
 *
 * @example
 * <Button variant="none" className={legacyButtonStyles.glass}>취소</Button>
 *
 * @deprecated 화면별 디자인이 Figma 로 정리되는 대로 하나씩 없앤다.
 * 새 화면에서는 쓰지 말고 Figma 명세의 variant 4종을 사용한다.
 */
export const legacyButtonStyles = {
  /** 구 `default` · `cancel`: 흰 배경 + 1px outline + 그림자. */
  surface:
    "bg-bg-base text-text-label outline-1 outline-border shadow-sm hover:text-primary-hover hover:outline-primary-hover hover:shadow-md active:text-primary-active active:outline-primary-active",
  /** 구 `text`: 배경 없는 텍스트 버튼. */
  text: "bg-transparent text-text-primary hover:bg-bg-text-hover active:bg-bg-text-active",
  /** 구 `link`: primary 색 + hover 밑줄. */
  link: "bg-transparent text-primary underline-offset-4 hover:text-primary-hover hover:underline",
  /** 구 `outline`: 2px 테두리, hover 에서 primary 로 채워진다. */
  outline:
    "bg-transparent text-text-primary border-2 border-border shadow-sm hover:bg-primary hover:text-text-light-solid hover:shadow-md active:bg-primary-active active:text-text-light-solid",
  /** 구 `glass`: 반투명 흰 배경 + 블러. 컬러 배경 위에서만 의도대로 보인다. */
  glass:
    "bg-white/20 text-text-primary border border-white/30 shadow-lg backdrop-blur-md hover:bg-white/30 hover:border-white/50 hover:shadow-xl",
  /** 구 `softWarning`: 옅은 warning 배경 + warning 글자. */
  softWarning:
    "bg-warning-bg text-warning shadow-sm hover:bg-warning-bg-hover hover:shadow-md active:bg-warning-border",
  /** 구 `success`: 초록 채움. 완료·저장 확인에 쓰였다. */
  success:
    "bg-success text-text-light-solid shadow-lg transform hover:bg-success-hover hover:shadow-xl hover:scale-105 active:bg-success-active",
  /** 구 `submit`: 파란 채움. */
  submit: "bg-blue-5 text-text-light-solid active:bg-blue-6",
  /** 구 `gradient`: primary 그라데이션 + hover 확대. */
  gradient:
    "bg-gradient-to-r from-primary to-primary-hover text-text-light-solid shadow-lg transform hover:from-primary-hover hover:to-primary-active hover:shadow-xl hover:scale-105"
} as const;
