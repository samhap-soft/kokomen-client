import { Button, Modal, PostingContent } from "@kokomen/ui";
import { JSX, useEffect, useState } from "react";

// 노출할 포스팅(공지) 식별자. md 파일명과 동일하게 관리한다.
const POSTING_ID: string = "user_interview";
const POSTING_PATH: string = `/postings/${POSTING_ID}.md`;
const STORAGE_KEY: string = `posting-dismissed-until:${POSTING_ID}`;
const ONE_DAY_MS: number = 24 * 60 * 60 * 1000;

// 오늘 하루 보지 않기 설정이 유효한지 확인
const isDismissed = (): boolean => {
  try {
    const until = window.localStorage.getItem(STORAGE_KEY);
    if (!until) return false;
    return Date.now() < Number(until);
  } catch {
    return false;
  }
};

export default function PostingPopup(): JSX.Element | null {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [content, setContent] = useState<string>("");
  const [doNotShowToday, setDoNotShowToday] = useState<boolean>(false);

  useEffect(() => {
    if (isDismissed()) return;

    let active = true;
    fetch(POSTING_PATH)
      .then((res) => (res.ok ? res.text() : Promise.reject(res.status)))
      .then((text) => {
        if (!active) return;
        setContent(text);
        setIsOpen(true);
      })
      .catch(() => {
        // 포스팅 로드 실패 시 팝업을 띄우지 않는다.
      });

    return () => {
      active = false;
    };
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
      title="📢 공지"
      size="lg"
      closeButton
      backdropClose
      escToClose
    >
      <div className="flex flex-col gap-5">
        <PostingContent content={content} />

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
