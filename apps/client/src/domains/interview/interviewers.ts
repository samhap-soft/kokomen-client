/**
 * 선택 가능한 면접관 목록.
 *
 * 모델은 모두 같은 RPM 스켈레톤 + Mixamo 애니메이션을 쓰기 때문에
 * packages/ui 의 avatarMesh 가 요구하는 규약을 그대로 만족한다.
 *   - 애니메이션 클립: idle / thumbsup / clap / disappointed (전부 소문자)
 *   - 본: Head
 *   - 모프타겟: mouthOpen, mouthSmile (이름에 head 가 들어간 메시가 보유)
 * 새 면접관을 추가할 때는 이 규약을 맞춘 GLB 여야 한다.
 */
export type InterviewerId = "default" | "senior" | "navy" | "gray";

export type Interviewer = {
  id: InterviewerId;
  name: string;
  description: string;
  /** 모델 파일명 */
  file: string;
};

// 지금은 로컬 public/models 에서 서빙한다.
// CDN 으로 옮길 때는 이 값만 `${process.env.NEXT_PUBLIC_CDN_BASE_URL}/models` 로 바꾸면 된다.
const MODEL_BASE: string = "/models";

export const INTERVIEWERS: Interviewer[] = [
  {
    id: "default",
    name: "기본 면접관",
    description: "안경을 쓴 캐주얼 차림이에요.",
    file: "interviewer.glb"
  },
  {
    id: "senior",
    name: "시니어 면접관",
    description: "반백 머리에 안경을 쓴, 연차가 있어 보이는 면접관이에요.",
    file: "interviewer-senior.glb"
  },
  {
    id: "navy",
    name: "네이비 면접관",
    description: "네이비 니트를 입은 면접관이에요.",
    file: "interviewer-navy.glb"
  },
  {
    id: "gray",
    name: "그레이 면접관",
    description: "다크브라운 머리에 그레이 니트를 입은 면접관이에요.",
    file: "interviewer-gray.glb"
  }
];

export const DEFAULT_INTERVIEWER_ID: InterviewerId = "default";

const BY_ID: Record<string, Interviewer> = Object.fromEntries(
  INTERVIEWERS.map((interviewer) => [interviewer.id, interviewer])
);

/** 저장된 값이 목록에 없는 id 면(모델을 내리거나 이름을 바꾼 경우) 기본값으로 되돌린다. */
export function isInterviewerId(value: unknown): value is InterviewerId {
  return typeof value === "string" && value in BY_ID;
}

export function getInterviewerAvatarUrl(id: InterviewerId): string {
  const interviewer = BY_ID[id] ?? BY_ID[DEFAULT_INTERVIEWER_ID];
  return `${MODEL_BASE}/${interviewer.file}`;
}
