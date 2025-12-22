import { Button, Sidebar } from "@kokomen/ui";
import { Layers, PackageOpen, X } from "lucide-react";
import { useSidebar } from "@kokomen/utils";
import {
  ArchivedResumeAndPortfolio,
  CamelCasedProperties
} from "@kokomen/types";
import { formatDate } from "@/utils/date";
import { useQuery } from "@tanstack/react-query";
import { archiveKeys } from "@/utils/querykeys";
import { getArchivedResumes } from "@/domains/resume/api";

function ArchiveButton({
  type = "ALL",
  onClickResume,
  isLoggedIn
}: {
  type: "ALL" | "RESUME" | "PORTFOLIO";
  // eslint-disable-next-line no-unused-vars
  onClickResume: (data: {
    resume_id?: string;
    resume_name?: string;
    portfolio_id?: string;
    portfolio_name?: string;
  }) => void;
  isLoggedIn: boolean;
}) {
  const { open, openSidebar, closeSidebar } = useSidebar();
  const handleClick = () => {
    openSidebar();
  };
  return (
    <>
      <Button variant="primary" type="button" onClick={handleClick}>
        <Layers />
      </Button>
      <Sidebar open={open} onClose={closeSidebar}>
        <div>
          <nav className="flex justify-end">
            <Button variant="text" type="button" onClick={closeSidebar}>
              <X size={24} />
            </Button>
          </nav>
          <section className="flex flex-col gap-8 p-4">
            <div>
              <h1 className="text-lg font-bold">
                이력서 및 포트폴리오 가져오기
              </h1>
              <p className="text-sm text-text-secondary">
                이력서를 업로드하면 자동으로 아카이빙돼요.
              </p>
            </div>
            <ArchiveList
              type={type}
              isLoggedIn={isLoggedIn}
              onClickResume={onClickResume}
              closeSidebar={closeSidebar}
            />
          </section>
        </div>
      </Sidebar>
    </>
  );
}

function ArchiveItem({
  title,
  createdAt,
  onClick
}: CamelCasedProperties<ArchivedResumeAndPortfolio> & { onClick: () => void }) {
  return (
    <Button
      variant="soft"
      type="button"
      className="w-full flex flex-col border border-border rounded-lg p-4 items-start break-words whitespace-pre-line text-left"
      onClick={onClick}
    >
      <h3 className="text-text-label font-bold">{title}</h3>
      <p className="text-sm text-text-secondary">{formatDate(createdAt)}</p>
    </Button>
  );
}

function ArchiveListEmpty({ type }: { type: "ALL" | "RESUME" | "PORTFOLIO" }) {
  return (
    <div className="flex flex-col gap-2 border border-border rounded-lg p-4 justify-center items-center">
      <PackageOpen size={24} className="text-text-secondary" />
      <p className="text-lg text-text-secondary">
        아직 보관된 {type === "RESUME" ? "이력서" : "포트폴리오"}가 없어요.
      </p>
    </div>
  );
}

function ArchiveList({
  type = "ALL",
  isLoggedIn,
  onClickResume,
  closeSidebar
}: {
  type: "ALL" | "RESUME" | "PORTFOLIO";
  isLoggedIn: boolean;
  // eslint-disable-next-line no-unused-vars
  onClickResume: (data: {
    resume_id?: string;
    resume_name?: string;
    portfolio_id?: string;
    portfolio_name?: string;
  }) => void;
  closeSidebar: () => void;
}) {
  const { data } = useQuery({
    queryKey: archiveKeys.resumes(type),
    queryFn: () => getArchivedResumes(type),
    enabled: isLoggedIn,
    select: (data) => data,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 5
  });
  const list =
    type === "ALL"
      ? data?.resumes
      : type === "RESUME"
        ? data?.resumes
        : data?.portfolios;

  const onclickArchivedItem = (
    type: "RESUME" | "PORTFOLIO",
    item: CamelCasedProperties<ArchivedResumeAndPortfolio>
  ) => {
    if (type === "RESUME") {
      onClickResume({
        resume_id: item.id.toString(),
        resume_name: item.title
      });
    } else if (type === "PORTFOLIO") {
      onClickResume({
        portfolio_id: item.id.toString(),
        portfolio_name: item.title
      });
    }
  };
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold">
          {type === "ALL"
            ? "이력서"
            : type === "RESUME"
              ? "이력서"
              : "포트폴리오"}
        </h2>
        {list?.map((item) => (
          <ArchiveItem
            key={item.id}
            {...item}
            onClick={() => {
              onclickArchivedItem(
                type === "ALL"
                  ? "RESUME"
                  : type === "RESUME"
                    ? "RESUME"
                    : "PORTFOLIO",
                item
              );
              closeSidebar();
            }}
          />
        ))}
        {list?.length === 0 && <ArchiveListEmpty type={type} />}
      </div>
    </div>
  );
}

export { ArchiveButton };
