import { useCallback, useEffect, useRef, useState } from "react";

export type InterviewSettings = {
  // 질문별 답변 제한 시간 사용 여부
  isTimeLimitEnabled: boolean;
  // 한 번 입력한 답변을 수정·삭제할 수 없게 할지 여부
  isAppendOnlyEnabled: boolean;
};

export type InterviewSettingKey = keyof InterviewSettings;

// 기본값은 둘 다 끔. 사용자가 실전처럼 연습하고 싶을 때 직접 켜는 옵션이다.
export const DEFAULT_INTERVIEW_SETTINGS: InterviewSettings = {
  isTimeLimitEnabled: false,
  isAppendOnlyEnabled: false
};

const STORAGE_KEY: string = "interview-settings";

// 저장된 설정을 읽는다. 값이 깨져 있거나 localStorage를 쓸 수 없으면 기본값을 쓴다.
const readStoredSettings = (): InterviewSettings => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_INTERVIEW_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<InterviewSettings>;
    return {
      isTimeLimitEnabled:
        typeof parsed.isTimeLimitEnabled === "boolean"
          ? parsed.isTimeLimitEnabled
          : DEFAULT_INTERVIEW_SETTINGS.isTimeLimitEnabled,
      isAppendOnlyEnabled:
        typeof parsed.isAppendOnlyEnabled === "boolean"
          ? parsed.isAppendOnlyEnabled
          : DEFAULT_INTERVIEW_SETTINGS.isAppendOnlyEnabled
    };
  } catch {
    return DEFAULT_INTERVIEW_SETTINGS;
  }
};

type UseInterviewSettings = {
  settings: InterviewSettings;
  // eslint-disable-next-line no-unused-vars
  toggleSetting: (key: InterviewSettingKey) => void;
};

/**
 * 면접 진행 중에도 켜고 끌 수 있는 옵션을 관리한다.
 *
 * 서버 렌더 결과와 어긋나지 않도록 첫 렌더는 항상 기본값으로 하고,
 * 마운트 후에 저장된 설정을 읽어와 반영한다.
 */
export function useInterviewSettings(): UseInterviewSettings {
  const [settings, setSettings] = useState<InterviewSettings>(
    DEFAULT_INTERVIEW_SETTINGS
  );
  // 저장된 값을 읽기 전(첫 렌더)에 기본값을 덮어쓰지 않도록 첫 실행은 건너뛴다
  const hasLoadedRef = useRef<boolean>(false);

  useEffect(() => {
    setSettings(readStoredSettings());
  }, []);

  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // localStorage 사용 불가 시 이번 면접에만 적용된다
    }
  }, [settings]);

  const toggleSetting = useCallback((key: InterviewSettingKey): void => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return { settings, toggleSetting };
}
