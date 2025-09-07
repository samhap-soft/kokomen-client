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

export type {
  Purchase,
  Product,
  PurchaseHistory,
  RefundReason,
  Refund,
  PurchaseError,
  PurchaseSuccessQuery,
  RefundCode
};
