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
