import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminPayment } from "@kokomen/types";
import { Modal, Button, useToast } from "@kokomen/ui";
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

const formatDateShort = (dateStr: string | null): string => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const PaymentCard = ({
  payment,
  isCanceling,
  onCancel
}: {
  payment: AdminPayment;
  isCanceling: boolean;
  // eslint-disable-next-line no-unused-vars
  onCancel: (payment: AdminPayment) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const tossStatus = payment.state;
  const isCanceled = payment.result.canceledAt || payment.result.cancelReason;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm truncate">
                {payment.orderName}
              </span>
              <span
                className={`shrink-0 inline-block px-1.5 py-0.5 rounded text-xs font-medium ${tossStatus.className}`}
              >
                {tossStatus}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{formatDateShort(payment.result.approvedAt)}</span>
              <span>·</span>
              <span>
                {payment.result.easyPayProvider
                  ? `${payment.result.method}(${payment.result.easyPayProvider})`
                  : payment.result.method}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="font-semibold text-sm">
              {payment.totalAmount.toLocaleString()}원
            </span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            <div>
              <span className="text-gray-500">ID</span>
              <span className="ml-2 text-gray-700">{payment.id}</span>
            </div>
            <div>
              <span className="text-gray-500">결제상태</span>
              <span className="ml-2 text-gray-700">{payment.state}</span>
            </div>
            <div>
              <span className="text-gray-500">요청일</span>
              <span className="ml-2 text-gray-700">
                {formatDateShort(payment.result.requestedAt)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">승인일</span>
              <span className="ml-2 text-gray-700">
                {formatDateShort(payment.result.approvedAt)}
              </span>
            </div>
          </div>

          {isCanceled && (
            <div className="mt-2 p-2 rounded bg-red-50 text-xs text-red-600">
              <p>취소사유: {payment.result.cancelReason ?? "-"}</p>
              <p>취소일: {formatDateTime(payment.result.canceledAt)}</p>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            {payment.result.receiptUrl && (
              <a
                href={payment.result.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
              >
                영수증
              </a>
            )}
            {!isCanceled && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel(payment);
                }}
                disabled={isCanceling}
                className="px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isCanceling ? "처리중..." : "결제 취소"}
              </button>
            )}
            {isCanceled && (
              <span className="text-xs text-gray-400">취소됨</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const PaymentRow = ({
  payment,
  isCanceling,
  onCancel
}: {
  payment: AdminPayment;
  isCanceling: boolean;
  // eslint-disable-next-line no-unused-vars
  onCancel: (payment: AdminPayment) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const tossStatus = tossStatusLabel[payment.result.tosspaymentsStatus] ?? {
    text: payment.result.tosspaymentsStatus,
    className: "text-gray-600 bg-gray-50"
  };
  const isCanceled = payment.result.canceledAt || payment.result.cancelReason;

  return (
    <>
      <tr
        onClick={() => setExpanded(!expanded)}
        className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <td className="px-4 py-3 font-medium">{payment.orderName}</td>
        <td className="px-4 py-3 text-right tabular-nums">
          {payment.totalAmount.toLocaleString()}원
        </td>
        <td className="px-4 py-3 text-center">
          <span
            className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${tossStatus.className}`}
          >
            {tossStatus.text}
          </span>
        </td>
        <td className="px-4 py-3 text-gray-500 text-xs">
          {formatDateShort(payment.result.approvedAt)}
        </td>
        <td className="px-4 py-3 text-center">
          {!isCanceled ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCancel(payment);
              }}
              disabled={isCanceling}
              className="px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              취소
            </button>
          ) : (
            <span className="text-xs text-gray-400">취소됨</span>
          )}
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-gray-100">
          <td colSpan={5} className="px-4 py-3 bg-gray-50">
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
              <div>
                <span className="text-gray-500">ID</span>
                <span className="ml-1.5 text-gray-700">{payment.id}</span>
              </div>
              <div>
                <span className="text-gray-500">결제방법</span>
                <span className="ml-1.5 text-gray-700">
                  {payment.result.easyPayProvider
                    ? `${payment.result.method}(${payment.result.easyPayProvider})`
                    : payment.result.method}
                </span>
              </div>
              <div>
                <span className="text-gray-500">결제상태</span>
                <span className="ml-1.5 text-gray-700">{payment.state}</span>
              </div>
              <div>
                <span className="text-gray-500">요청일</span>
                <span className="ml-1.5 text-gray-700">
                  {formatDateShort(payment.result.requestedAt)}
                </span>
              </div>
              {payment.result.receiptUrl && (
                <a
                  href={payment.result.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  영수증 보기
                </a>
              )}
            </div>
            {isCanceled && (
              <div className="mt-2 p-2 rounded bg-red-50 text-xs text-red-600">
                취소사유: {payment.result.cancelReason ?? "-"} · 취소일:{" "}
                {formatDateShort(payment.result.canceledAt)} · 취소상태:{" "}
                {payment.result.cancelStatus ?? "-"}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
};

const AdminPaymentHistorySection = (): JSX.Element => {
  const [page, setPage] = useState(0);
  const [cancelTarget, setCancelTarget] = useState<AdminPayment | null>(null);
  const queryClient = useQueryClient();
  const { error: errorToast, success: successToast } = useToast();

  const { data, isLoading, isError } = useQuery({
    queryKey: adminPaymentKeys.list(page),
    queryFn: () => getAdminPayments(page)
  });

  const { mutate: cancelPayment, isPending: isCanceling } = useMutation({
    mutationFn: cancelAdminPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPaymentKeys.all });
      setCancelTarget(null);
      successToast({ title: "결제가 취소되었습니다." });
    },
    onError: (error: Error) => {
      setCancelTarget(null);
      errorToast({
        title: "결제 취소 실패",
        description: error.message ?? "서버 오류가 발생했습니다."
      });
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
        <span className="text-sm text-gray-500">총 {data.totalCount}건</span>
      </div>

      {/* 모바일: 카드 레이아웃 */}
      <div className="flex flex-col gap-3 md:hidden">
        {data.data.map((payment: AdminPayment) => (
          <PaymentCard
            key={payment.id}
            payment={payment}
            isCanceling={isCanceling}
            onCancel={setCancelTarget}
          />
        ))}
      </div>

      {/* 데스크탑: 간소화된 테이블 + 펼침 행 */}
      <div className="hidden md:block rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                주문명
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">
                금액
              </th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">
                상태
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                승인일
              </th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">
                관리
              </th>
            </tr>
          </thead>
          <tbody>
            {data.data.map((payment: AdminPayment) => (
              <PaymentRow
                key={payment.id}
                payment={payment}
                isCanceling={isCanceling}
                onCancel={setCancelTarget}
              />
            ))}
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

      <Modal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="결제 취소"
        size="sm"
        escToClose
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-700">이 결제를 취소하시겠습니까?</p>
          {cancelTarget && (
            <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 border border-gray-200">
              <p>결제 ID: {cancelTarget.id}</p>
              <p>주문명: {cancelTarget.orderName}</p>
              <p>금액: {cancelTarget.totalAmount.toLocaleString()}원</p>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="soft" onClick={() => setCancelTarget(null)}>
              닫기
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (cancelTarget) cancelPayment(cancelTarget.id);
              }}
              disabled={isCanceling}
              className="bg-red-500 hover:bg-red-600"
            >
              {isCanceling ? "처리중..." : "결제 취소"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminPaymentHistorySection;
