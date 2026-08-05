import { Button, Modal } from "@kokomen/ui";
import Image from "next/image";
import { JSX, useEffect, useState } from "react";

const STORAGE_KEY = "resume-guide-dismissed-until";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// 하루동안 보지 않기 설정이 유효한지 확인
const isDismissed = (): boolean => {
  try {
    const until = window.localStorage.getItem(STORAGE_KEY);
    if (!until) return false;
    return Date.now() < Number(until);
  } catch {
    return false;
  }
};

export default function ResumeGuideModal(): JSX.Element | null {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [doNotShowToday, setDoNotShowToday] = useState<boolean>(false);

  useEffect(() => {
    if (!isDismissed()) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = (): void => {
    if (doNotShowToday) {
      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          String(Date.now() + ONE_DAY_MS)
        );
      } catch {
        // localStorage 사용 불가 시 무시
      }
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="이력서 기능이란게 뭔가요?"
      size="2xl"
      closeButton
      backdropClose
      escToClose
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-6 md:flex-row">
          <Image
            src="/kokomenReport.png"
            alt="꼬꼬면 이력서 분석"
            width={200}
            height={200}
            className="w-40 h-auto flex-shrink-0"
          />
          <ul className="flex flex-col gap-4 text-text-secondary">
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>
                내 이력서와 포트폴리오를 기반으로 이력서와 포트폴리오를 분석하고
                개선점을 제안해요.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>이력서 기반의 기술 면접 질문도 골라줘요!</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>회원가입을 하지 않아도 이용할 수 있어요.</span>
            </li>
          </ul>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-gray-200 pt-4">
          <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={doNotShowToday}
              onChange={(e) => setDoNotShowToday(e.target.checked)}
              className="h-4 w-4 cursor-pointer accent-primary"
            />
            하루동안 보지 않을래요
          </label>
          <Button variant="primary" onClick={handleClose}>
            확인
          </Button>
        </div>
      </div>
    </Modal>
  );
}
