type Product = {
  order_name: string;
  product_name: string;
  price: number;
};

type Purchase = Product & {
  payment_key: string;
  order_id: string;
};

type PurchaseHistory = {
  id: number;
  price: number;
  order_name: string;
  product_name: string;
  count: number;
  remaining_count: number;
  state: string;
  payment_method: string;
  easy_pay_provider?: string;
};

type RefundCode =
  | "CHANGE_OF_MIND"
  | "NO_LONGER_USING_SERVICE"
  | "NOT_AS_EXPECTED"
  | "SERVICE_DISSATISFACTION"
  | "TECHNICAL_ISSUE"
  | "OTHER";
type RefundReason = {
  code: RefundCode;
  message: string;
  requires_reason_text: boolean;
};

type Refund = {
  refund_reason_code: RefundCode;
  refund_reason_text?: string;
};

type PurchaseError = {};
type PurchaseSuccessQuery = {
  orderId: string;
  paymentKey: string;
  amount: number;
};

type AdminPaymentResult = {
  method: string;
  balanceAmount: number;
  tosspaymentsStatus: string;
  requestedAt: string;
  approvedAt: string;
  cancelReason: string | null;
  canceledAt: string | null;
  cancelStatus: string | null;
  receiptUrl: string | null;
  easyPayProvider: string | null;
};

type AdminPayment = {
  id: number;
  paymentKey: string;
  memberId: number;
  orderId: string;
  orderName: string;
  totalAmount: number;
  metadata: string;
  state: string;
  serviceType: string;
  createdAt: string;
  updatedAt: string;
  result?: AdminPaymentResult | null;
};

type AdminPaymentPageResponse = {
  data: AdminPayment[];
  currentPage: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
};

export type {
  Purchase,
  Product,
  PurchaseHistory,
  RefundReason,
  Refund,
  PurchaseError,
  PurchaseSuccessQuery,
  RefundCode,
  AdminPayment,
  AdminPaymentResult,
  AdminPaymentPageResponse
};
