import { CamelCasedProperties, Paginated } from "../utils";

type RecruitFilters = {
  region: string[];
  // ['정규직', '계약직']
  employee_type: string[];
  // 학력
  education: string[];
  // ['백엔드', '프론트엔드']
  employment: string[];
  // ['상시채용', '정규채용']
  deadline_type: string[];
};

interface RecruitFilterRequest extends RecruitFilters {
  career_min: number | null;
  career_max: number | null;
}

type RecruitItem = {
  id: string;
  // 제휴사
  affiliate: {
    name: string;
    image: string;
  };
  company: {
    id: string;
    name: string;
    image: string; // 파일 경로나 URL 문자열
  };
  title: string;
  end_date: string | null; // ISO 날짜 문자열 또는 null
  deadline_type: string; // 예: "상시채용"
  career_min: number | null; // 경력 최소년수 (없을 수 있음)
  career_max: number | null; // 경력 최대년수 (없을 수 있음)
  region: string[]; // 예: ["서울"]
  employee_type: string[]; // 예: ["정규직"]
  education: string[]; // 예: ["무관"]
  employment: string[]; // 예 : ["백엔드", "프론트엔드"]
  url: string;
};
type PaginatedRecruitList = Paginated<CamelCasedProperties<RecruitItem>[]>;

export type {
  RecruitItem,
  PaginatedRecruitList,
  RecruitFilters,
  RecruitFilterRequest
};
