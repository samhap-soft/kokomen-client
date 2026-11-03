import InterviewHistory from "./interviewHistory";
import ChangeNickname from "@/domains/dashboard/components/changeNickname";
import Withdrawal from "@/domains/dashboard/components/withDrawl";
import ResumeEvaluationHistory from "@/domains/resume/components/resumeEvaluationHistory";
import ArchivePreview from "@/domains/resume/components/archivePreview";
import { UserInfo } from "@kokomen/types";
import { Button } from "@kokomen/ui";
import Link from "next/link";
import { useRouter } from "next/router";
import { JSX } from "react";

// 마이페이지 섹션은 ?tab= 쿼리로 고른다. 새로고침이나 링크 공유 시에도 같은 섹션이 열린다.
// TODO "이력서 기반 면접 질문"(Figma 899:1411)은 쓰던 /interviews/resume-based API 가 dev 에서 404 라 숨겨 두었다.
export const DASHBOARD_TABS = [
  "interviews",
  "resume-analyses",
  "archive",
  "nickname",
  "withdrawal"
] as const;
export type DashboardTab = (typeof DASHBOARD_TABS)[number];

const DEFAULT_TAB: DashboardTab = "interviews";

const isDashboardTab = (value: unknown): value is DashboardTab =>
  typeof value === "string" &&
  (DASHBOARD_TABS as readonly string[]).includes(value);

/** 잘못된 값이나 빈 값이면 기본 탭(면접 기록)으로 둔다. */
export const parseDashboardTab = (value: unknown): DashboardTab =>
  isDashboardTab(value) ? value : DEFAULT_TAB;

const MENU_GROUPS: {
  title: string;
  items: { label: string; tab: DashboardTab }[];
}[] = [
  {
    title: "면접",
    items: [
      { label: "면접 기록", tab: "interviews" },
      { label: "이력서 평가 기록", tab: "resume-analyses" }
    ]
  },
  { title: "아카이브", items: [{ label: "아카이브", tab: "archive" }] },
  {
    title: "유저 정보 관리",
    items: [
      { label: "닉네임 변경", tab: "nickname" },
      { label: "회원 탈퇴", tab: "withdrawal" }
    ]
  }
];

const POLICY_LINKS: { label: string; href: string }[] = [
  { label: "서비스 이용 약관", href: "/terms/termsofuse" },
  { label: "개인정보 처리 방침", href: "/terms/privacy" }
];

const menuItemClassName: string =
  "flex h-14 w-full items-center justify-start rounded-xl p-4 text-left text-base font-semibold transition-colors";

interface SelectSectionProps {
  userInfo: UserInfo;
}

export default function SelectSection({
  userInfo
}: SelectSectionProps): JSX.Element {
  const router = useRouter();
  const tab = parseDashboardTab(router.query.tab);

  // 탭을 바꾸면 이전 탭의 page 같은 쿼리는 버린다.
  const handleTabClick = (nextTab: DashboardTab): void => {
    router.replace(
      { pathname: router.pathname, query: { tab: nextTab } },
      undefined,
      {
        shallow: true,
        scroll: false
      }
    );
  };

  return (
    <section className="flex flex-col gap-8 lg:flex-row lg:gap-6">
      <nav
        aria-label="마이페이지 메뉴"
        className="flex flex-col gap-8 lg:w-[177px] lg:shrink-0"
      >
        {MENU_GROUPS.map((group) => (
          <div key={group.title} className="flex flex-col gap-4 pb-4">
            <p className="text-sm font-medium text-text-secondary">
              {group.title}
            </p>
            <ul className="flex flex-col">
              {group.items.map((item) => {
                const isActive = item.tab === tab;
                return (
                  <li key={item.tab}>
                    <Button
                      variant="none"
                      aria-current={isActive ? "page" : undefined}
                      className={`${menuItemClassName} ${
                        isActive
                          ? "bg-primary-1 text-primary"
                          : "text-text-primary hover:bg-fill-quaternary"
                      }`}
                      onClick={() => handleTabClick(item.tab)}
                    >
                      {item.label}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        <div className="flex flex-col gap-4 pb-4">
          <p className="text-sm font-medium text-text-secondary">
            약관 및 정책
          </p>
          <ul className="flex flex-col">
            {POLICY_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`${menuItemClassName} text-text-primary hover:bg-fill-quaternary`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="min-w-0 flex-1">
        <SelectedSection tab={tab} userInfo={userInfo} />
      </div>
    </section>
  );
}

function SelectedSection({
  tab,
  userInfo
}: {
  tab: DashboardTab;
  userInfo: UserInfo;
}): JSX.Element {
  switch (tab) {
    case "resume-analyses":
      return <ResumeEvaluationHistory />;
    case "archive":
      return <ArchivePreview />;
    case "nickname":
      return <ChangeNickname userInfo={userInfo} />;
    case "withdrawal":
      return <Withdrawal />;
    case "interviews":
    default:
      return <InterviewHistory />;
  }
}
