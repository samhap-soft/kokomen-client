import { useInfiniteRecruitList } from "@/domains/recruit/hooks/useInfiniteRecruitList";
import { Button, RoundSpinner } from "@kokomen/ui";
import { CamelCasedProperties } from "@kokomen/types";
import { RecruitItem as RecruitItemType } from "@kokomen/types";
import Image from "next/image";
import Link from "next/link";
import { Bug, Building2, PackageOpen } from "lucide-react";
import { captureButtonEvent } from "@/utils/analytics";

function RecruitItem({
  recruit
}: {
  recruit: CamelCasedProperties<RecruitItemType>;
}) {
  const { company, title, careerMin, careerMax, region, url } = recruit;

  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener"
      prefetch={false}
      onClick={() => {
        captureButtonEvent({
          name: "CareerClicked",
          properties: {
            company: company.name,
            title: title
          }
        });
      }}
      className="block p-4 rounded-lg border border-gray-200 hover:border-primary hover:shadow-md transition-all"
    >
      <div className="flex gap-4">
        {/* 회사 로고 */}
        <div className="flex-shrink-0 w-[100px] h-[100px]">
          {company.image ? (
            <Image
              src={company.image}
              alt={company.name}
              width={100}
              height={100}
              className="w-full h-full rounded-lg object-contain"
            />
          ) : (
            <div className="w-full h-full bg-primary-light rounded-lg flex items-center justify-center">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
          )}
        </div>

        {/* 채용 정보 */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-gray-900 truncate mb-1">
            {title}
          </h3>
          <p className="text-sm text-gray-600 mb-2">{company.name}</p>
          <div className="flex flex-wrap gap-2 text-sm text-gray-500">
            {region && <span>{region.join(", ")}</span>}
            {(careerMin !== undefined || careerMax !== undefined) && (
              <span>
                {careerMin ? `${careerMin}년~` : "신입~"}
                {careerMax ? `${careerMax}년` : ""}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export function RecruitList() {
  const { data, loadMoreRef, isFetching, isError, refetch } =
    useInfiniteRecruitList();

  if (isError) return <RecruitListError refetch={refetch} />;
  if (data?.length === 0) return <RecruitListEmpty />;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {data?.map((recruit) => (
          <RecruitItem key={recruit.id} recruit={recruit} />
        ))}
      </div>
      <div className="w-full h-10" ref={loadMoreRef} />
      {isFetching && (
        <div className="flex justify-center py-6">
          <RoundSpinner />
        </div>
      )}
    </>
  );
}

function RecruitListError({ refetch }: { refetch: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <Bug />
      <p>데이터를 불러오는 중 오류가 발생했습니다.</p>
      <Button variant="soft" className="font-bold" onClick={() => refetch()}>
        다시 시도하기
      </Button>
    </div>
  );
}

function RecruitListEmpty() {
  return (
    <div className="flex flex-col items-center gap-2 my-10">
      <PackageOpen />
      <p>검색된 채용 공고가 없어요.</p>
    </div>
  );
}
