# 아이콘 목록

프로젝트에서 쓰는 아이콘은 세 갈래다.

| 갈래 | 개수 | 위치 | 성격 |
|---|---|---|---|
| 디자인 시스템 아이콘 | 30 | `packages/ui/src/components/icon/index.tsx` | Figma Foundation/Icon 에서 옮겨온 fill 기반 24x24 |
| lucide-react | 71 | `lucide-react` 패키지 | stroke 기반. 앱 화면에서 주로 사용 |
| SVG 에셋 | 19 | `apps/client/public/` | 로고·일러스트. 아이콘 컴포넌트가 아님 |

두 아이콘 세트는 fill/stroke 차이 때문에 시각적으로 섞이지 않는다.
디자인 시스템 컴포넌트 내부에서는 `@kokomen/ui` 아이콘을 쓰고,
아직 대응 아이콘이 없는 앱 화면에서는 lucide 를 쓴다.

Storybook: `Foundation/Icon`

---

## 1. 디자인 시스템 아이콘 (30개)

`@kokomen/ui` 에서 export 된다. 모두 `size`(기본 24)와 `className` 을 받고 색은 `currentColor` 를 따른다.

| 컴포넌트 | Figma 이름 | 제품 코드 사용 |
|---|---|---|
| `AddIcon` | `icon_add` | – |
| `AddCircleIcon` | `icon_add_circle` | – |
| `AlertIcon` | `icon_alret` | 1 |
| `ArrowBackwardIcon` | `icon_arrow-backward` | – |
| `ArrowDownwardIcon` | `icon_arrow-downward` | – |
| `ArrowForwardIcon` | `icon_arrow-forward` | – |
| `ArrowUpwardIcon` | `icon_arrow-upward` | – |
| `ChartIcon` | `icon_chart` | – |
| `CheckIcon` | `icon_check` | 1 |
| `CheckCircleIcon` | `icon_check-circle` | 1 |
| `ChevronDownIcon` | `icon_chevron-down` | 2 |
| `ChevronLeftIcon` | `icon_chevron_left` | – |
| `ChevronRightIcon` | `icon_chevron_right` | 1 |
| `ChevronUpIcon` | `icon_chevron-up` | 1 |
| `ClockIcon` | `icon_clock` | – |
| `CloseIcon` | `icon_close` | 3 |
| `HelpIcon` | `icon_help` | – |
| `InfoIcon` | `icon_info` | 1 |
| `MedalIcon` | `icon_medal` | – |
| `MicIcon` | `icon_mic` | – |
| `MicOffIcon` | `icon_mic_off` | – |
| `MoneyIcon` | `icon_money` | – |
| `MyProfileIcon` | `icon_my_profile` | 1 |
| `SearchIcon` | `icon_search` | 1 |
| `StarIcon` | `icon_star` | – |
| `SubtractCircleIcon` | `icon_subtract_circle` | – |
| `SubtractionIcon` | `icon_subtraction` | – |
| `UploadIcon` | `icon_upload` | – |
| `VolumeOffIcon` | `icon_volume_off` | – |
| `VolumeOnIcon` | `icon_volume_on` | – |

`–` 인 20개는 Figma 에서 옮겨왔지만 아직 제품 코드에 호출부가 없다(스토리에만 등장하는 것 포함).
대응하는 lucide 아이콘을 쓰고 있는 자리를 하나씩 바꿔 나가면 된다.

---

## 2. lucide-react (71개)

앱과 `packages/ui` 양쪽에서 import 해 쓰는 아이콘이다. 사용 파일 수 순.
스토리 파일은 집계에서 뺐다.

| 아이콘 | 제품 코드 사용 |
|---|---|
| `CheckCircle` | 7 |
| `Check` | 5 |
| `Clock` | 5 |
| `TrendingUp` | 5 |
| `Trophy` | 5 |
| `X` | 5 |
| `AlertTriangle` | 4 |
| `Calendar` | 4 |
| `Eye` | 4 |
| `Heart` | 4 |
| `Loader2` | 4 |
| `MessageSquare` | 4 |
| `Star` | 4 |
| `AlertCircle` | 3 |
| `Award` | 3 |
| `ChevronRight` | 3 |
| `Coins` | 3 |
| `Crown` | 3 |
| `FileText` | 3 |
| `LogIn` | 3 |
| `Mic` | 3 |
| `User` | 3 |
| `XCircle` | 3 |
| `ChevronDown` | 2 |
| `ChevronLeft` | 2 |
| `ChevronUp` | 2 |
| `CloudUpload` | 2 |
| `HelpCircle` | 2 |
| `Home` | 2 |
| `Medal` | 2 |
| `NotebookPen` | 2 |
| `PackageOpen` | 2 |
| `RotateCcw` | 2 |
| `Trash2` | 2 |
| `ArrowBigUp` | 1 |
| `Bell` | 1 |
| `Briefcase` | 1 |
| `Bug` | 1 |
| `Building2` | 1 |
| `CalendarSearch` | 1 |
| `Camera` | 1 |
| `CameraOff` | 1 |
| `CircleStop` | 1 |
| `Code2` | 1 |
| `CreditCard` | 1 |
| `ExternalLink` | 1 |
| `Info` | 1 |
| `Keyboard` | 1 |
| `Layers` | 1 |
| `LayoutDashboard` | 1 |
| `Lightbulb` | 1 |
| `Lock` | 1 |
| `LogOut` | 1 |
| `Menu` | 1 |
| `MessageCircle` | 1 |
| `MessageCircleWarning` | 1 |
| `MicVocal` | 1 |
| `Package` | 1 |
| `Pencil` | 1 |
| `Play` | 1 |
| `Search` | 1 |
| `Settings` | 1 |
| `Share2` | 1 |
| `SidebarIcon` | 1 |
| `Sparkles` | 1 |
| `Target` | 1 |
| `Trash` | 1 |
| `TrendingDown` | 1 |
| `TriangleAlert` | 1 |
| `Users` | 1 |
| `Volume2` | 1 |

---

## 3. SVG 에셋 (19개)

`next/image` 로 직접 읽는 파일이다. 아이콘 컴포넌트가 아니라 로고·일러스트다.

**(루트)**

- `card-backend.svg`
- `card-frontend.svg`
- `card-network.svg`
- `card-os.svg`
- `hurray.svg`
- `logo.svg`
- `sad.svg`
- `zighang.svg`

**company**

- `company/coupang.svg`
- `company/daanggn.svg`
- `company/kakao.svg`
- `company/naver.svg`
- `company/toss.svg`
- `company/woowa.svg`

**icons**

- `icons/interview.svg`
- `icons/report.svg`

**kokobot**

- `kokobot/fixReport.svg`
- `kokobot/medal.svg`
- `kokobot/rank.svg`
