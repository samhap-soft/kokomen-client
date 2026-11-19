import type { InterviewerClip } from "@kokomen/ui/domains";

/**
 * 선택 가능한 면접관 목록.
 *
 * 면접관은 실사 영상 클립 묶음이다(Higgsfield 로 같은 인물 · 같은 장면에서 만든 짧은 영상).
 * 모든 클립은 첫 장면과 끝 장면이 같아서, 서로 바꿔 틀어도 이음매가 보이지 않는다.
 *   - idle: 듣는 중(반복)
 *   - speaking: 질문 음성이 나오는 동안(반복). 실제 음성과 입 모양은 맞지 않는다
 *   - positive: 좋은 답변 뒤 한 번(A · B 등급)
 *   - thinking: 아쉬운 답변 뒤 한 번(D · F 등급)
 * 파일은 public/interviewer/{id}/ 에 둔다(poster.jpg + 클립 4개). CDN 으로 옮길 때는 INTERVIEWER_BASE 만 바꾼다.
 *
 * 지금은 겉모습만 다르고 질문 말투 · 목소리는 같다.
 * 면접관별 분위기(예: 시니어는 깊게, 임원은 격식 있게)도 말투와 함께 백엔드에서 반영할 목표다.
 * 면접관별 목소리(TTS)와 말투는 백엔드가 면접관 id 를 받아 반영하는 것을 목표로 한다(voice 필드).
 */
export type InterviewerId = "default" | "senior" | "manager" | "executive";

export type { InterviewerClip };

export type Interviewer = {
  id: InterviewerId;
  /** 어떤 면접관인지. 입장 화면 카드에 사진과 함께 보인다 */
  name: string;
  /**
   * 면접관별 목소리(TTS 음성 id). 아직 백엔드가 지원하지 않아 비워 둔다.
   * 지원되면 면접 생성 요청에 함께 보내 질문 음성을 면접관마다 다르게 만든다.
   */
  voice?: string;
};

const INTERVIEWER_BASE: string = "/interviewer";

export const INTERVIEWERS: Interviewer[] = [
  {
    id: "default",
    name: "개발자 면접관"
  },
  {
    id: "senior",
    name: "시니어 테크 리드"
  },
  {
    id: "manager",
    name: "엔지니어링 매니저"
  },
  {
    id: "executive",
    name: "임원 면접관"
  }
];

export const DEFAULT_INTERVIEWER_ID: InterviewerId = "default";

const BY_ID: Record<string, Interviewer> = Object.fromEntries(
  INTERVIEWERS.map((interviewer) => [interviewer.id, interviewer])
);

/** 저장된 값이 목록에 없는 id 면(면접관을 내리거나 이름을 바꾼 경우) 기본값으로 되돌린다. */
export function isInterviewerId(value: unknown): value is InterviewerId {
  return typeof value === "string" && value in BY_ID;
}

export function getInterviewer(id: InterviewerId): Interviewer {
  return BY_ID[id] ?? BY_ID[DEFAULT_INTERVIEWER_ID];
}

export function getInterviewerClipUrl(
  id: InterviewerId,
  clip: InterviewerClip
): string {
  return `${INTERVIEWER_BASE}/${getInterviewer(id).id}/${clip}.mp4`;
}

export function getInterviewerClipUrls(
  id: InterviewerId
): Record<InterviewerClip, string> {
  return {
    idle: getInterviewerClipUrl(id, "idle"),
    speaking: getInterviewerClipUrl(id, "speaking"),
    positive: getInterviewerClipUrl(id, "positive"),
    thinking: getInterviewerClipUrl(id, "thinking")
  };
}

export function getInterviewerPosterUrl(id: InterviewerId): string {
  return `${INTERVIEWER_BASE}/${getInterviewer(id).id}/poster.jpg`;
}
