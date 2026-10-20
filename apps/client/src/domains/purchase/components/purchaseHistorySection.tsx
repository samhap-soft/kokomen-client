import { useInfiniteQuery } from "@tanstack/react-query";
import { useIntersectionObserver } from "@kokomen/utils";
import { JSX, RefObject } from "react";
import { CamelCasedProperties, PurchaseHistory } from "@kokomen/types";
import { getPurchaseHistory } from "@/domains/purchase/api";
import { Button, MoneyIcon, RoundSpinner } from "@kokomen/ui";
import Image from "next/image";
import Refund from "@/domains/purchase/components/refund";
import { TokenHistory, TokenHistoryHeader } from "@kokomen/ui/domains";
import { purchaseKeys } from "@/utils/querykeys";

export default function TokenPurchaseHistorySection(): JSX.Element {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: purchaseKeys.purchaseHistory(),
      queryFn: ({ pageParam = 0 }) =>
        getPurchaseHistory({ page: pageParam, size: 10 }),
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) => {
        const currentPage = allPages.length - 1;
        if (currentPage < lastPage.totalPageCount - 1) {
          return currentPage + 1;
        }
        return undefined;
      }
    });

  const [observerTarget] = useIntersectionObserver({
    callback: () => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    threshold: 0.3,
    rootMargin: "100px"
  });

  const allPurchases = data?.pages.flatMap((page) => page.tokenPurchases) || [];

  return (
    <section className="mx-auto flex w-full max-w-[1182px] flex-col gap-8 px-5 pt-8 pb-[260px] xl:px-0">
      <div className="flex flex-col gap-2 text-lg">
        <h1 className="font-semibold text-text-primary">구매 내역</h1>
        <p className="font-medium text-text-secondary">
          구매한 토큰과 결제 정보를 확인하세요.
        </p>
      </div>
      {status === "pending" ? (
        <div className="flex h-64 items-center justify-center">
          <RoundSpinner />
        </div>
      ) : status === "error" ? (
        <div className="flex flex-col items-center justify-center gap-6 py-10">
          <Image src="/sad.svg" alt="sad" width={100} height={100} />
          <p className="text-base text-text-tertiary">
            구매 내역을 불러오는데 실패했습니다.
          </p>
          <Button
            variant="primary"
            size={"large"}
            onClick={() => window.location.reload()}
            className="w-full max-w-sm"
          >
            새로고침
          </Button>
        </div>
      ) : allPurchases.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-20">
          <MoneyIcon size={48} className="mb-2 text-text-quaternary" />
          <h3 className="text-lg font-medium text-text-primary">
            구매 내역이 없습니다
          </h3>
          <p className="text-sm text-text-tertiary">
            토큰을 구매하면 여기에 표시됩니다
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="flex items-center gap-2 text-base font-semibold">
            <span className="text-text-primary">전체 구매</span>
            <span className="text-primary">{allPurchases.length}건</span>
          </p>
          <div className="overflow-x-auto">
            <div className="min-w-[1182px]">
              <TokenHistoryHeader />
              {allPurchases.map(
                (purchase: CamelCasedProperties<PurchaseHistory>) => (
                  <TokenHistory
                    {...purchase}
                    key={purchase.id}
                    RefundComponent={<Refund purchaseId={purchase.id} />}
                  />
                )
              )}
            </div>
          </div>
          {hasNextPage && (
            <div
              ref={observerTarget as RefObject<HTMLDivElement>}
              className="flex justify-center py-6"
            >
              {isFetchingNextPage ? (
                <RoundSpinner />
              ) : (
                <p className="text-xs text-text-quaternary">
                  스크롤하여 더 보기
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
