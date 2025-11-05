import { useRecruitFilter } from "@/domains/recruit/components/recruitFilterContext";
import { RecruitFilters } from "@kokomen/types";
import { Button, Range, Select } from "@kokomen/ui";
import { CalendarSearch } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function RecruitFilter({
  filterOptions
}: {
  filterOptions: RecruitFilters;
}) {
  const { filters, dispatch } = useRecruitFilter();
  const { region, employeeType, education, employment, deadlineType } = filters;

  return (
    <div className="gap-2 grid grid-cols-2 md:flex items-center w-full">
      <CareerRange />
      <Select
        placeholder="지역"
        className="min-w-32"
        options={
          filterOptions.region.map((region) => ({
            value: region,
            label: region
          })) ?? []
        }
        onChange={(value) =>
          dispatch({ type: "SET_REGION", region: value as string })
        }
        value={region}
        multiSelect
      />
      <Select
        placeholder="채용 유형"
        className="min-w-32"
        options={
          filterOptions.employeeType.map((employeeType) => ({
            value: employeeType,
            label: employeeType
          })) ?? []
        }
        onChange={(value) =>
          dispatch({
            type: "SET_EMPLOYEE_TYPE",
            employeeType: value as string
          })
        }
        value={employeeType}
        multiSelect
      />
      <Select
        placeholder="학력"
        className="min-w-32"
        options={
          filterOptions.education.map((education) => ({
            value: education,
            label: education
          })) ?? []
        }
        onChange={(value) =>
          dispatch({ type: "SET_EDUCATION", education: value as string })
        }
        value={education}
        multiSelect
      />
      <Select
        placeholder="직무"
        className="min-w-48"
        options={
          filterOptions.employment.map((employment) => ({
            value: employment,
            label: employment
          })) ?? []
        }
        onChange={(value) =>
          dispatch({ type: "SET_EMPLOYMENT", employment: value as string })
        }
        value={employment}
        multiSelect
      />
      <Select
        placeholder="마감 유형"
        className="min-w-32"
        options={
          filterOptions.deadlineType.map((deadlineType) => ({
            value: deadlineType,
            label: deadlineType
          })) ?? []
        }
        onChange={(value) =>
          dispatch({
            type: "SET_DEADLINE_TYPE",
            deadlineType: value as string
          })
        }
        value={deadlineType}
        multiSelect
      />
    </div>
  );
}

function CareerRange() {
  const [isOpen, setIsOpen] = useState(false);
  const { filters, dispatch } = useRecruitFilter();
  const careerRangeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.addEventListener("click", (event) => {
      if (
        careerRangeRef.current &&
        !careerRangeRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    });
    return () =>
      window.removeEventListener("click", (event) => {
        if (
          careerRangeRef.current &&
          !careerRangeRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      });
  }, []);

  return (
    <div className="relative" ref={careerRangeRef}>
      <Button
        type="button"
        variant="text"
        className="border-border border w-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CalendarSearch className="w-4 h-4" /> 경력
      </Button>
      {isOpen && (
        <div className="absolute top-12 left-0 flex flex-col gap-2 w-60 border border-border bg-white py-2 px-6 rounded-lg z-5">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 justify-between">
              <p className="-translate-x-3 text-sm font-medium">경력</p>
              <div className="flex text-text-label">
                <div className="flex justify-between translate-x-3">
                  <p className="text-sm font-medium">
                    {filters.careerMin ? `${filters.careerMin}년~` : "신입~"}
                  </p>
                  <p className="text-sm font-medium">
                    {filters.careerMax ? `${filters.careerMax}년` : "~10년+"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <Range
            min={0}
            max={10}
            defaultValue={[0, 10] as [number, number]}
            dual
            onChange={([min, max]) =>
              dispatch({
                type: "SET_CAREER_LIMIT",
                careerMin: min ?? 0,
                careerMax: max ?? 10
              })
            }
            unit="년"
          />
          <div className="flex justify-between">
            <p className="-translate-x-3 text-sm font-medium">신입</p>
            <p className="translate-x-3 text-sm font-medium">10년+</p>
          </div>
        </div>
      )}
    </div>
  );
}
