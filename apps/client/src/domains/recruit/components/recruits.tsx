import { RecruitFilter } from "@/domains/recruit/components/recruitFilter";
import { RecruitFilterProvider } from "@/domains/recruit/components/recruitFilterContext";
import { RecruitList } from "@/domains/recruit/components/recruitList";
import { RecruitFilters } from "@kokomen/types";

export function Recruits({ filterOptions }: { filterOptions: RecruitFilters }) {
  return (
    <section className="flex flex-col gap-4">
      <RecruitFilterProvider>
        <RecruitFilter filterOptions={filterOptions} />
        <RecruitList />
      </RecruitFilterProvider>
    </section>
  );
}
