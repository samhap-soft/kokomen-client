import type { Meta, StoryObj } from "@storybook/react";
import { JSX } from "react";
import * as Lucide from "lucide-react";
import * as Icons from "./index";
import type { IconProps } from "./index";

/**
 * 프로젝트 아이콘 목록. 전체 인벤토리는 `docs/icons.md` 에 정리돼 있다.
 *
 * - 디자인 시스템 아이콘 30개 — Figma Foundation/Icon 에서 옮겨온 fill 기반 24x24
 * - lucide-react — stroke 기반. 아직 대응 아이콘이 없는 앱 화면에서 쓴다
 */
const meta: Meta = {
  title: "Foundation/Icon",
  parameters: {
    layout: "fullscreen"
  },
  tags: ["autodocs"]
};

export default meta;
type Story = StoryObj<typeof meta>;

type IconComponent = (props: IconProps) => JSX.Element;

/** `index.tsx` 의 export 를 그대로 읽으므로 아이콘을 추가하면 자동으로 늘어난다. */
const DESIGN_SYSTEM_ICONS: [string, IconComponent][] = Object.entries(Icons)
  .filter(
    (entry): entry is [string, IconComponent] =>
      typeof entry[1] === "function" && entry[0].endsWith("Icon")
  )
  .sort(([a], [b]) => a.localeCompare(b));

const Cell = ({
  name,
  children
}: {
  name: string;
  children: React.ReactNode;
}): JSX.Element => (
  <div className="flex flex-col items-center gap-2 rounded-lg border border-border p-3">
    <div className="flex h-8 items-center text-text-primary">{children}</div>
    <span className="text-center text-xs break-all text-text-tertiary">
      {name}
    </span>
  </div>
);

const Grid = ({ children }: { children: React.ReactNode }): JSX.Element => (
  <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-3">
    {children}
  </div>
);

/** 디자인 시스템 아이콘 전체. */
export const All: Story = {
  render: () => (
    <div className="bg-bg-base p-8">
      <h2 className="mb-1 text-lg font-bold text-text-primary">
        디자인 시스템 아이콘 ({DESIGN_SYSTEM_ICONS.length}개)
      </h2>
      <p className="mb-5 text-sm text-text-tertiary">
        @kokomen/ui 에서 export 된다. 24x24 fill 기반이고 색은 currentColor 를
        따른다.
      </p>
      <Grid>
        {DESIGN_SYSTEM_ICONS.map(([name, Icon]) => (
          <Cell key={name} name={name}>
            <Icon />
          </Cell>
        ))}
      </Grid>
    </div>
  )
};

/** `size` 는 한 변 길이(px)다. 기본값은 Figma 원본 크기인 24 다. */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-6 bg-bg-base p-8">
      {[16, 20, 24, 32, 48].map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <Icons.MyProfileIcon size={size} className="text-primary" />
          <span className="text-xs text-text-tertiary">{size}px</span>
        </div>
      ))}
    </div>
  )
};

/**
 * 색은 `fill="currentColor"` 라서 텍스트 색 유틸리티로 바꾼다.
 * 아이콘마다 색 prop 을 따로 두지 않는다.
 */
export const Colors: Story = {
  render: () => (
    <div className="flex items-center gap-6 bg-bg-base p-8">
      {[
        ["text-text-primary", "기본"],
        ["text-primary", "primary"],
        ["text-red-5", "danger"],
        ["text-blue-5", "accent"],
        ["text-text-tertiary", "비활성"]
      ].map(([className, label]) => (
        <div key={className} className="flex flex-col items-center gap-2">
          <Icons.AlertIcon size={32} className={className} />
          <span className="text-xs text-text-tertiary">{label}</span>
        </div>
      ))}
    </div>
  )
};

/**
 * 제품 코드에서 실제로 import 해 쓰는 lucide 아이콘 71개다.
 * fill 기반인 디자인 시스템 아이콘과 섞이지 않으니, 같은 화면에서는
 * 한쪽으로 통일한다. 대응 아이콘이 생기면 위 목록으로 옮겨간다.
 */
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

export const LucideInUse: Story = {
  render: () => (
    <div className="bg-bg-base p-8">
      <h2 className="mb-1 text-lg font-bold text-text-primary">
        lucide-react ({LUCIDE_IN_USE.length}개)
      </h2>
      <p className="mb-5 text-sm text-text-tertiary">
        stroke 기반이라 디자인 시스템 아이콘과 시각적으로 섞이지 않는다.
      </p>
      <Grid>
        {LUCIDE_IN_USE.map((name) => {
          const Icon = (Lucide as unknown as Record<string, IconComponent>)[
            name
          ];
          if (!Icon) return null;
          return (
            <Cell key={name} name={name}>
              <Icon size={24} />
            </Cell>
          );
        })}
      </Grid>
    </div>
  )
};
