import { useState, JSX } from "react";
import InterviewHistory from "./interviewHistory";
import ChangeNickname from "@/domains/dashboard/components/changeNickname";
import Withdrawal from "@/domains/dashboard/components/withDrawl";
import { UserInfo } from "@kokomen/types";
import { Accordion, Button } from "@kokomen/ui";
import { useRouter } from "@tanstack/react-router";

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

export default function SelectSection({
  userInfo
}: SelectSectionProps): JSX.Element {
  const [section, setSection] = useState<Section>("interview");

  const handleTabClick = (selectedSection: Section): void => {
    setSection(selectedSection);
  };
  const router = useRouter();

  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8 ">
      {/* 네비게이션 탭 */}
      <div className="lg:w-64 flex-shrink-0">
        <nav className="space-y-1">
          <div className="flex flex-col gap-2">
            <Accordion.Accordion>
              <Accordion.AccordionItem
                itemKey={interviewSections[0].value}
                key={interviewSections[0].value}
              >
                <Accordion.AccordionTrigger>
                  <p className="text-sm font-medium text-text-secondary">
                    면접
                  </p>
                </Accordion.AccordionTrigger>
                <Accordion.AccordionContent>
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
                </Accordion.AccordionContent>
              </Accordion.AccordionItem>
            </Accordion.Accordion>
            <Accordion.Accordion>
              <Accordion.AccordionItem
                itemKey={userSections[0].value}
                key={userSections[0].value}
              >
                <Accordion.AccordionTrigger>
                  <p className="text-sm font-medium text-text-secondary">
                    유저 정보 관리
                  </p>
                </Accordion.AccordionTrigger>
                <Accordion.AccordionContent>
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
                </Accordion.AccordionContent>
              </Accordion.AccordionItem>
            </Accordion.Accordion>

            <Accordion.Accordion>
              <Accordion.AccordionItem
                itemKey={userSections[0].value}
                key={userSections[0].value}
              >
                <Accordion.AccordionTrigger>
                  <p className="text-sm font-medium text-text-secondary">
                    약관 및 정책
                  </p>
                </Accordion.AccordionTrigger>
                <Accordion.AccordionContent>
                  <Button
                    variant={"link"}
                    onClick={() => router.navigate({ to: "/terms/termsofuse" })}
                    className="justify-start"
                  >
                    서비스 이용 약관
                  </Button>
                  <Button
                    variant={"link"}
                    onClick={() => router.navigate({ to: "/terms/privacy" })}
                    className="justify-start"
                  >
                    개인정보 처리 방침
                  </Button>
                </Accordion.AccordionContent>
              </Accordion.AccordionItem>
            </Accordion.Accordion>
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
}): JSX.Element | null {
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
