interface User {
  id: number;
  nickname: string;
  profile_completed: boolean;
  is_admin?: boolean;
}

interface UserInfo extends User {
  score: number;
  total_member_count: number;
  token_count: number;
  rank: number;
  is_test_user: boolean;
  /**
   * 온보딩 설문 작성 완료 여부. false면 온보딩 폼으로 이동시킨다.
   * 서버 프로필 응답에 아직 포함되지 않아 optional로 둔다.
   */
  onboarding_form_filled?: boolean;
}

export type { User, UserInfo };
