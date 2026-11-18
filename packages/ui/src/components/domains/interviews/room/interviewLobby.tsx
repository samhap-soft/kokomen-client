import { JSX, ReactNode } from "react";
import { Button } from "../../../button";

export interface InterviewLobbyProps {
  /** 예: "프론트엔드 모의면접" */
  title: string;
  /** 면접 방식 · 질문 수 같은 요약. 한 줄씩 보여준다 */
  details: string[];
  /** 내 카메라 미리보기 타일 */
  preview: ReactNode;
  /** 미리보기 아래 기기 버튼(카메라 · 마이크 켜고 끄기) */
  deviceControls?: ReactNode;
  /** 입장 전 알아둘 점 */
  notice?: ReactNode;
  /** 입장 전에 고르는 옵션(면접관 선택 · 면접 설정 등). 입장 버튼 위에 놓인다 */
  options?: ReactNode;
  onJoin: () => void;
  isJoinDisabled?: boolean;
  joinLabel?: string;
}

/**
 * 면접 입장 전 화면. 예전의 노크 · 문 열림 연출을 대신한다.
 *
 * Google Meet 의 입장 화면처럼 왼쪽에서 카메라를 미리 보고, 오른쪽에서 옵션을 고른 뒤 입장한다.
 * lg 미만에서는 미리보기 아래에 입장 영역을 쌓는다. Figma 시안은 없다.
 */
export function InterviewLobby({
  title,
  details,
  preview,
  deviceControls,
  notice,
  options,
  onJoin,
  isJoinDisabled = false,
  joinLabel = "면접 입장하기"
}: InterviewLobbyProps): JSX.Element {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[1280px] flex-col items-center justify-center gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:gap-16 lg:px-8">
      <div className="flex w-full max-w-[720px] flex-col gap-3 lg:flex-[1.4]">
        <div className="aspect-video w-full">{preview}</div>
        {deviceControls && (
          <div className="flex justify-center gap-3">{deviceControls}</div>
        )}
      </div>
      <div className="flex w-full max-w-[720px] flex-col items-center gap-6 text-center lg:flex-1 lg:items-start lg:text-left">
        <div className="flex flex-col gap-2">
          <p className="text-base text-text-secondary">면접을 시작할 준비가 되셨나요?</p>
          <h1 className="text-2xl font-bold text-text-primary md:text-3xl">
            {title}
          </h1>
        </div>
        <ul className="flex flex-col gap-1.5 text-base text-text-secondary md:text-lg">
          {details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
        {options && <div className="w-full">{options}</div>}
        {notice}
        <Button
          type="button"
          variant="primary"
          size="xl"
          onClick={onJoin}
          disabled={isJoinDisabled}
          className="w-full sm:w-auto sm:min-w-64"
        >
          {joinLabel}
        </Button>
      </div>
    </div>
  );
}
