import {
  DEFAULT_INTERVIEWER_ID,
  InterviewerId,
  isInterviewerId
} from "@/domains/interview/interviewers";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY: string = "kokomen:interviewer";

/**
 * 고른 면접관. 다음 면접에서도 같은 면접관이 나오도록 localStorage 에 기억한다.
 *
 * 서버 렌더 결과와 어긋나지 않도록 첫 렌더는 기본 면접관으로 하고, 마운트 후 저장된 값을 읽는다.
 * 저장된 값이 목록에 없으면(면접관을 내린 경우) 기본 면접관을 쓴다.
 */
export function useSelectedInterviewer(): {
  interviewerId: InterviewerId;
  // eslint-disable-next-line no-unused-vars
  selectInterviewer: (id: InterviewerId) => void;
} {
  const [interviewerId, setInterviewerId] = useState<InterviewerId>(
    DEFAULT_INTERVIEWER_ID
  );

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isInterviewerId(stored)) setInterviewerId(stored);
    } catch {
      // localStorage 를 쓸 수 없으면 기본 면접관을 쓴다
    }
  }, []);

  const selectInterviewer = useCallback((id: InterviewerId) => {
    setInterviewerId(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // 저장하지 못하면 이번 면접에만 적용된다
    }
  }, []);

  return { interviewerId, selectInterviewer };
}
