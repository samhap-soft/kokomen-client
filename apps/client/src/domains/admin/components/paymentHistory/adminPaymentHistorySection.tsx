import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminPayment } from "@kokomen/types";
import { cancelAdminPayment, getAdminPayments } from "@/domains/admin/api";
import { adminPaymentKeys } from "@/utils/querykeys";
import { JSX, useState } from "react";

const tossStatusLabel: Record<string, { text: string; className: string }> = {
  READY: { text: "준비", className: "text-gray-600 bg-gray-50" },
  IN_PROGRESS: { text: "진행중", className: "text-blue-600 bg-blue-50" },
  DONE: { text: "완료", className: "text-green-600 bg-green-50" },
  CANCELED: { text: "취소", className: "text-red-600 bg-red-50" },
  PARTIAL_CANCELED: {
    text: "부분취소",
    className: "text-orange-600 bg-orange-50"
  },
  ABORTED: { text: "중단", className: "text-red-600 bg-red-50" },
  EXPIRED: { text: "만료", className: "text-gray-500 bg-gray-100" }
};

const formatDateTime = (dateStr: string | null): string => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const AdminPaymentHistorySection = (): JSX.Element => {
  const [page, setPage] = useState(0);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: adminPaymentKeys.list(page),
    queryFn: () => getAdminPayments(page)
  });

  const { mutate: cancelPayment, isPending: isCanceling } = useMutation({
    mutationFn: cancelAdminPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPaymentKeys.all });
    }
  });

  if (isLoading) {
    return (
      <div>
        <h2 className="text-xl font-bold mb-4">결제 내역</h2>
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div>
        <h2 className="text-xl font-bold mb-4">결제 내역</h2>
        <p className="text-red-500">결제 내역을 불러오는데 실패했습니다.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">결제 내역</h2>
        <span className="text-sm text-gray-500">
          총 {data.totalCount}건
        </span>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                ID
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                주문명
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">
                금액
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                결제방법
              </th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">
                토스상태
              </th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">
                결제상태
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                요청일
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                승인일
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                영수증
              </th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">
                관리
              </th>
            </tr>
          </thead>
          <tbody>
            {data.data.map((payment: AdminPayment) => {
              const tossStatus = tossStatusLabel[
                payment.result.tosspaymentsStatus
              ] ?? {
                text: payment.result.tosspaymentsStatus,
                className: "text-gray-600 bg-gray-50"
              };
              const isCanceled =
                payment.result.canceledAt || payment.result.cancelReason;

              return (
                <tr
                  key={payment.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-500">{payment.id}</td>
                  <td className="px-4 py-3 font-medium">
                    {payment.orderName}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {payment.totalAmount.toLocaleString()}원
                  </td>
                  <td className="px-4 py-3">
                    {payment.result.easyPayProvider
                      ? `${payment.result.method} (${payment.result.easyPayProvider})`
                      : payment.result.method}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${tossStatus.className}`}
                    >
                      {tossStatus.text}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-block px-2 py-1 rounded-md text-xs font-medium text-gray-700 bg-gray-100">
                      {payment.state}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDateTime(payment.result.requestedAt)}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDateTime(payment.result.approvedAt)}
                  </td>
                  <td className="px-4 py-3">
                    {payment.result.receiptUrl ? (
                      <a
                        href={payment.result.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-xs"
                      >
                        영수증
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {!isCanceled ? (
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `결제 ID ${payment.id} (${payment.orderName})을 취소하시겠습니까?`
                            )
                          ) {
                            cancelPayment(payment.id);
                          }
                        }}
                        disabled={isCanceling}
                        className="px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {isCanceling ? "처리중..." : "취소"}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">취소됨</span>
                    )}
                  </td>
                  {isCanceled && (
                    <td
                      colSpan={9}
                      className="px-4 py-2 text-xs text-red-500 bg-red-50"
                    >
                      취소사유: {payment.result.cancelReason ?? "-"} |
                      취소일: {formatDateTime(payment.result.canceledAt)} |
                      취소상태: {payment.result.cancelStatus ?? "-"}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 text-sm rounded-md border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            이전
          </button>
          <span className="text-sm text-gray-600">
            {page + 1} / {data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!data.hasNext}
            className="px-3 py-1.5 text-sm rounded-md border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentHistorySection;
