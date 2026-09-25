import type { Meta, StoryObj } from "@storybook/react";
import { JSX } from "react";
import * as LucideIcons from "lucide-react";
import * as Icons from "./index";
import type { IconProps } from "./index";

/**
 * 프로젝트에서 **실제로 쓰이는** 아이콘만 모아 놓은 목록이다.
 * 아직 호출부가 없는 아이콘까지 포함한 전체 목록은 `Foundation/Icon` 에 있고,
 * 파일 단위 집계는 `docs/icons.md` 에 정리돼 있다.
 *
 * NOTE 아래 두 목록은 집계 시점의 스냅샷이다. 아이콘을 새로 쓰기 시작하거나
 * 쓰지 않게 되면 직접 갱신해야 한다. 스토리 파일에서만 쓰는 아이콘은 뺐다.
 */
const meta: Meta = {
  title: "Foundation/Icons In Use",
  parameters: {
    layout: "fullscreen"
  },
  tags: ["autodocs"]
};

export default meta;
type Story = StoryObj<typeof meta>;

type IconComponent = (props: IconProps) => JSX.Element;

/** 디자인 시스템 아이콘 중 호출부가 있는 것. `[아이콘, 쓰이는 곳]` */
const DESIGN_SYSTEM_IN_USE: [string, string][] = [
  ["AlertIcon", "toast"],
  ["CheckCircleIcon", "toast"],
  ["CheckIcon", "select"],
  ["ChevronDownIcon", "dropdown · select"],
  ["ChevronRightIcon", "textButton"],
  ["ChevronUpIcon", "dropdown"],
  ["CloseIcon", "modal · sidebar · toast"],
  ["InfoIcon", "toast"],
  ["MyProfileIcon", "gnb"],
  ["SearchIcon", "select"]
];

/** 제품 코드에서 import 하는 lucide 아이콘. */
const LUCIDE_IN_USE: string[] = [
  "AlertCircle",
  "AlertTriangle",
  "ArrowBigUp",
  "Award",
  "Bell",
  "Briefcase",
  "Bug",
  "Building2",
  "Calendar",
  "CalendarSearch",
  "Camera",
  "CameraOff",
  "Check",
  "CheckCircle",
  "ChevronDown",
  "ChevronLeft",
  "ChevronRight",
  "ChevronUp",
  "CircleStop",
  "Clock",
  "CloudUpload",
  "Code2",
  "Coins",
  "CreditCard",
  "Crown",
  "ExternalLink",
  "Eye",
  "FileText",
  "Heart",
  "HelpCircle",
  "Home",
  "Info",
  "Keyboard",
  "Layers",
  "LayoutDashboard",
  "Lightbulb",
  "Loader2",
  "Lock",
  "LogIn",
  "LogOut",
  "Medal",
  "Menu",
  "MessageCircle",
  "MessageCircleWarning",
  "MessageSquare",
  "Mic",
  "MicVocal",
  "NotebookPen",
  "Package",
  "PackageOpen",
  "Pencil",
  "Play",
  "RotateCcw",
  "Search",
  "Settings",
  "Share2",
  "SidebarIcon",
  "Sparkles",
  "Star",
  "Target",
  "Trash",
  "Trash2",
  "TrendingDown",
  "TrendingUp",
  "TriangleAlert",
  "Trophy",
  "User",
  "Users",
  "Volume2",
  "X",
  "XCircle"
];

const Cell = ({
  name,
  caption,
  children
}: {
  name: string;
  caption?: string;
  children: React.ReactNode;
}): JSX.Element => (
  <div className="flex flex-col items-center gap-1.5 rounded-lg border border-border p-3">
    <div className="flex h-8 items-center text-text-primary">{children}</div>
    <span className="text-center text-xs break-all text-text-primary">
      {name}
    </span>
    {caption ? (
      <span className="text-center text-[11px] break-all text-text-tertiary">
        {caption}
      </span>
    ) : null}
  </div>
);

const Grid = ({ children }: { children: React.ReactNode }): JSX.Element => (
  <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3">
    {children}
  </div>
);

const Section = ({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}): JSX.Element => (
  <section>
    <h2 className="mb-1 text-lg font-bold text-text-primary">{title}</h2>
    <p className="mb-5 text-sm text-text-tertiary">{description}</p>
    {children}
  </section>
);

/** 두 세트를 한눈에 본다. */
export const All: Story = {
  render: () => (
    <div className="flex flex-col gap-12 bg-bg-base p-8">
      <Section
        title={`디자인 시스템 아이콘 (${DESIGN_SYSTEM_IN_USE.length}개)`}
        description="@kokomen/ui 아이콘 중 호출부가 있는 것. 아래 캡션은 쓰이는 컴포넌트다."
      >
        <Grid>
          {DESIGN_SYSTEM_IN_USE.map(([name, where]) => {
            const Icon = (Icons as unknown as Record<string, IconComponent>)[
              name
            ];
            return (
              <Cell key={name} name={name} caption={where}>
                <Icon />
              </Cell>
            );
          })}
        </Grid>
      </Section>

      <Section
        title={`lucide-react (${LUCIDE_IN_USE.length}개)`}
        description="대응하는 디자인 시스템 아이콘이 없어 아직 lucide 를 쓰는 자리다."
      >
        <Grid>
          {LUCIDE_IN_USE.map((name) => {
            const Icon = (
              LucideIcons as unknown as Record<string, IconComponent>
            )[name];
            if (!Icon) return null;
            return (
              <Cell key={name} name={name}>
                <Icon size={24} />
              </Cell>
            );
          })}
        </Grid>
      </Section>
    </div>
  )
};

/** 디자인 시스템 아이콘만. 어디에 쓰이는지 같이 본다. */
export const DesignSystem: Story = {
  render: () => (
    <div className="bg-bg-base p-8">
      <Section
        title={`디자인 시스템 아이콘 (${DESIGN_SYSTEM_IN_USE.length}개)`}
        description="Figma Foundation/Icon 30개 중 실제 호출부가 있는 것만 추렸다."
      >
        <Grid>
          {DESIGN_SYSTEM_IN_USE.map(([name, where]) => {
            const Icon = (Icons as unknown as Record<string, IconComponent>)[
              name
            ];
            return (
              <Cell key={name} name={name} caption={where}>
                <Icon size={32} />
              </Cell>
            );
          })}
        </Grid>
      </Section>
    </div>
  )
};

/** lucide 아이콘만. 디자인 시스템 아이콘으로 옮겨갈 후보 목록이다. */
export const Lucide: Story = {
  render: () => (
    <div className="bg-bg-base p-8">
      <Section
        title={`lucide-react (${LUCIDE_IN_USE.length}개)`}
        description="stroke 기반이라 fill 기반 디자인 시스템 아이콘과 섞이지 않는다."
      >
        <Grid>
          {LUCIDE_IN_USE.map((name) => {
            const Icon = (
              LucideIcons as unknown as Record<string, IconComponent>
            )[name];
            if (!Icon) return null;
            return (
              <Cell key={name} name={name}>
                <Icon size={24} />
              </Cell>
            );
          })}
        </Grid>
      </Section>
    </div>
  )
};
