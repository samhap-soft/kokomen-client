import { useInfiniteQuery } from "@tanstack/react-query";
import { useIntersectionObserver } from "@kokomen/utils";
import { JSX, RefObject } from "react";
import { CamelCasedProperties, PurchaseHistory } from "@kokomen/types";
import { Package } from "lucide-react";
import { getPurchaseHistory } from "@/domains/purchase/api";
import { Button } from "@kokomen/ui";
import Image from "next/image";
import Refund from "@/domains/purchase/components/refund";
import { TokenHistory } from "@kokomen/ui/domains";
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

  if (status === "pending") {
    return (
      <section className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section className="container mx-auto p-6 flex flex-col items-center justify-center">
        <Image src="/sad.svg" alt="sad" width={100} height={100} />
        <div className="text-center py-10">
          <p className="text-gray-500">구매 내역을 불러오는데 실패했습니다.</p>
        </div>
        <Button
          variant="primary"
          size={"large"}
          onClick={() => window.location.reload()}
          className="w-1/2"
        >
          새로고침
        </Button>
      </section>
    );
  }

  const allPurchases = data?.pages.flatMap((page) => page.tokenPurchases) || [];

  if (allPurchases.length === 0) {
    return (
      <section className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center py-20">
          <Package className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            구매 내역이 없습니다
          </h3>
          <p className="text-sm text-gray-500">
            토큰을 구매하면 여기에 표시됩니다
          </p>
        </div>
      </section>
    );
  }
  return (
    <section className="container mx-auto p-6 mb-56">
      <div className="space-y-1 w-full text-center">
        {allPurchases.map((purchase: CamelCasedProperties<PurchaseHistory>) => (
          <TokenHistory
            {...purchase}
            key={purchase.id}
            RefundComponent={<Refund purchaseId={purchase.id} />}
          />
        ))}
      </div>

      {hasNextPage && (
        <div
          ref={observerTarget as RefObject<HTMLDivElement>}
          className="flex justify-center py-6"
        >
          {isFetchingNextPage ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          ) : (
            <p className="text-xs text-gray-400">스크롤하여 더 보기</p>
          )}
        </div>
      )}
    </section>
  );
}
