interface User {
  id: number;
  nickname: string;
  profile_completed: boolean;
}

interface UserInfo {
  score: number;
  total_member_count: number;
  token_count: number;
  rank: number;
}

export type { User, UserInfo };
