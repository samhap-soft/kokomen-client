import { useState } from "react";
import InterviewHistory from "./interviewHistory";
import ChangeNickname from "@/domains/dashboard/components/changeNickname";
import Withdrawal from "@/domains/dashboard/components/withDrawl";
import { UserInfo } from "@kokomen/types";
import { Button } from "@kokomen/ui";

type Section = "interview" | "changeNickname" | "withdrawal";

interface SelectSectionProps {
  userInfo: UserInfo;
}

const interviewSections: { label: string; value: Section }[] = [
  {
    label: "면접 기록",
    value: "interview"
  }
];

const userSections: { label: string; value: Section }[] = [
  {
    label: "닉네임 변경",
    value: "changeNickname"
  },
  {
    label: "회원 탈퇴",
    value: "withdrawal"
  }
];

export default function SelectSection({ userInfo }: SelectSectionProps) {
  const [section, setSection] = useState<Section>("interview");

  const handleTabClick = (selectedSection: Section) => {
    setSection(selectedSection);
  };

  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
      {/* 네비게이션 탭 */}
      <div className="lg:w-64 flex-shrink-0">
        <nav className="space-y-1">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-text-secondary">면접</p>
            {/* 면접 기록 탭 */}
            {interviewSections.map((sec) => (
              <Button
                variant={"link"}
                className={`w-full justify-start text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                  sec.value === section
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                key={sec.value}
                onClick={() => handleTabClick(sec.value as Section)}
              >
                {sec.label}
              </Button>
            ))}
            <hr className="my-4 border-t border-border-secondary" />

            <p className="text-sm font-medium text-text-secondary">
              유저 정보 관리
            </p>
            {/* 유저 설정 탭 */}
            {userSections.map((sec) => (
              <Button
                variant={"link"}
                className={`w-full justify-start text-left px-4 py-3 rounded-lg font-medium  ${
                  sec.value === section
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                key={sec.value}
                onClick={() => handleTabClick(sec.value as Section)}
              >
                {sec.label}
              </Button>
            ))}
          </div>
        </nav>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="flex-1">
        <SelectedSection section={section} userInfo={userInfo} />
      </div>
    </section>
  );
}

function SelectedSection({
  section,
  userInfo
}: {
  section: Section;
  userInfo: UserInfo;
}) {
  switch (section) {
    case "interview":
      return <InterviewHistory />;
    case "changeNickname":
      return <ChangeNickname userInfo={userInfo} />;
    case "withdrawal":
      return <Withdrawal />;
    default:
      return null;
  }
}
