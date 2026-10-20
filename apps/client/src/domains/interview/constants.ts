// 질문당 답변 제한 시간(초). "답변 시간 제한" 설정이 켜져 있을 때만 적용된다.
export const ANSWER_TIME_LIMIT_SECONDS: number = 90;

// 남은 시간을 스크린리더로 알려주는 지점(초). 매초 읽으면 방해가 되므로 임계점만 알린다.
export const TIMER_ANNOUNCE_THRESHOLDS: readonly number[] = [60, 30, 10];

// 이 시간 이하로 남으면 타이머를 경고 색으로 표시한다(초).
export const TIMER_LOW_THRESHOLD_SECONDS: number = 10;

/**
 * 음성 인식이 이만큼 새 발화 없이 조용하면 안내를 띄운다(ms).
 *
 * 브라우저 음성 인식은 몇 초만 조용해도 `onend`로 끊기기 때문에,
 * 세션 종료 자체를 "맥락 손실"로 보면 잠깐 숨을 고를 때마다 안내가 뜬다.
 * 그래서 세션 종료와 무관하게 실제 침묵 시간을 따로 재서 판단한다.
 */
export const VOICE_SILENCE_HINT_MS: number = 12000;

// 음성 면접 점검 기간 동안 음성 모드 선택을 막는다. 점검이 끝나면 false 로 되돌린다.
export const IS_VOICE_MODE_DISABLED: boolean = true;

export const VOICE_MODE_DISABLED_MESSAGE: string =
  "음성 면접은 현재 점검 중입니다";

/**
 * 면접 메인에서 카테고리 칩을 묶어 보여주는 그룹. Category API 에는 그룹 정보가 없어서
 * 프론트에서 key 로 매핑한다. 여기에 없는 key 는 "기타" 그룹으로 모인다.
 */
export const CATEGORY_GROUPS: readonly { title: string; keys: readonly string[] }[] = [
  {
    title: "CS 기초",
    keys: ["ALGORITHM_DATA_STRUCTURE", "DATABASE", "NETWORK", "OPERATING_SYSTEM"]
  },
  {
    title: "기술 스택",
    keys: ["JAVA_SPRING", "JAVASCRIPT_TYPESCRIPT", "REACT", "FRONTEND", "INFRA"]
  },
  { title: "인성", keys: ["PERSONALITY"] }
];

export const ETC_CATEGORY_GROUP_TITLE: string = "기타";

// 면접 메인의 "예상 소요" 계산에 쓰는 질문당 평균 소요 시간(분).
export const MINUTES_PER_QUESTION: number = 3;

// 면접 메인의 "이런 질문이 나와요"에 보여줄 예시 질문 개수.
export const SAMPLE_QUESTION_COUNT: number = 3;
