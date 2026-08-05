/** 이력서 분석 결과 페이지 경로 (비회원은 소유 증명 토큰을 쿼리로 유지) */
export function resumeAnalysisResultPath(
  analysisId: number | string,
  guestToken?: string
): string {
  const path = `/resume/analyses/${analysisId}`;
  return guestToken
    ? `${path}?guest_token=${encodeURIComponent(guestToken)}`
    : path;
}
