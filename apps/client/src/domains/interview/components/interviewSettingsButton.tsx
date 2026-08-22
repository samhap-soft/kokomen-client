import { JSX } from "react";
import { Button, Modal } from "@kokomen/ui";
import { useModal } from "@kokomen/utils";
import { Settings } from "lucide-react";
import { ANSWER_TIME_LIMIT_SECONDS } from "@/domains/interview/constants";
import type {
  InterviewSettingKey,
  InterviewSettings
} from "@/domains/interview/hooks/useInterviewSettings";

type SettingOption = {
  key: InterviewSettingKey;
  label: string;
  description: string;
};

const SETTING_OPTIONS: SettingOption[] = [
  {
    key: "isTimeLimitEnabled",
    label: "답변 시간 제한",
    description: `질문마다 ${ANSWER_TIME_LIMIT_SECONDS}초 안에 답변해야 하고, 시간이 지나면 지금까지 입력한 내용이 자동으로 제출돼요. 켠 순간부터 시간이 흐르기 시작해요.`
  },
  {
    key: "isAppendOnlyEnabled",
    label: "답변 수정 금지",
    description:
      "실제 면접처럼 한 번 입력한 답변은 지우거나 고칠 수 없어요. 켜는 순간까지 입력한 내용도 함께 잠겨요."
  }
];

type InterviewSettingsButtonProps = {
  settings: InterviewSettings;
  // eslint-disable-next-line no-unused-vars
  onToggle: (key: InterviewSettingKey) => void;
};

export default function InterviewSettingsButton({
  settings,
  onToggle
}: InterviewSettingsButtonProps): JSX.Element {
  const { isOpen, openModal, closeModal } = useModal();

  return (
    <>
      <Button
        variant={"default"}
        onClick={openModal}
        role="button"
        aria-label="면접 설정 열기"
        title="면접 설정"
        className="fixed top-2 left-16 sm:top-3 sm:left-20 z-50"
      >
        <Settings />
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        title="면접 설정"
        size={"lg"}
        escToClose
        backdropClose
      >
        <div className="flex flex-col gap-5">
          <p className="text-sm text-text-description">
            면접 도중에도 언제든 바꿀 수 있어요.
          </p>
          {SETTING_OPTIONS.map((option) => (
            <SettingToggleRow
              key={option.key}
              option={option}
              checked={settings[option.key]}
              onToggle={() => onToggle(option.key)}
            />
          ))}
          <Button
            type="button"
            variant={"primary"}
            size={"xl"}
            className="w-full"
            onClick={closeModal}
            aria-label="close-interview-settings"
          >
            확인
          </Button>
        </div>
      </Modal>
    </>
  );
}

function SettingToggleRow({
  option,
  checked,
  onToggle
}: {
  option: SettingOption;
  checked: boolean;
  onToggle: () => void;
}): JSX.Element {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border-secondary p-4">
      <div className="flex flex-col gap-1">
        <span className="font-semibold text-text-heading">{option.label}</span>
        <span className="text-sm text-text-description leading-relaxed">
          {option.description}
        </span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={option.label}
        onClick={onToggle}
        className={`relative mt-1 h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-fill"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-bg-base shadow-sm transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
