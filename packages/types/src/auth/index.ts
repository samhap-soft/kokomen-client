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
   * 서버 프로필 응답이 내려주는 값이며, 이 필드만으로 판단한다.
   */
  onboarding_form_filled: boolean;
}

export type { User, UserInfo };
