/**
 * 서버 프로필 응답(GET /members/me/profile)에 아직 온보딩 작성 여부 필드가 없어서,
 * 제출 완료를 쿠키로 함께 표시해둔다. 서버가 onboarding_form_filled를 내려주면
 * 이 파일과 사용처를 제거하면 된다.
 */
const ONBOARDING_SUBMITTED_COOKIE: string = "kokomen_onboarding_submitted";
const ONE_YEAR_IN_SECONDS: number = 60 * 60 * 24 * 365;

function markOnboardingSubmitted(): void {
  document.cookie = `${ONBOARDING_SUBMITTED_COOKIE}=1; path=/; max-age=${ONE_YEAR_IN_SECONDS}`;
}

function hasSubmittedOnboarding(
  cookies: Partial<Record<string, string>>
): boolean {
  return cookies[ONBOARDING_SUBMITTED_COOKIE] === "1";
}

export {
  ONBOARDING_SUBMITTED_COOKIE,
  markOnboardingSubmitted,
  hasSubmittedOnboarding
};
