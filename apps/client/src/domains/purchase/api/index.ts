import { mapToCamelCase } from "@/utils/convertConvention";
import {
  CamelCasedProperties,
  Product,
  PurchaseHistory,
  PurchaseSuccessQuery,
  RefundCode,
  RefundReason
} from "@kokomen/types";
import axios, { AxiosInstance, isAxiosError } from "axios";

const productInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL + "/products",
  withCredentials: true
});
function getProducts(): Promise<CamelCasedProperties<Product>[]> {
  return productInstance
    .get<Product[]>("", { timeout: 3000 })
    .then((res) => res.data.map(mapToCamelCase));
}

const purchaseInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL + "/token-purchases",
  withCredentials: true
});

function purchaseToken({
  amount,
  orderId,
  paymentKey,
  orderName,
  productName
}: PurchaseSuccessQuery & {
  orderName: string;
  productName: string;
}): Promise<void> {
  return purchaseInstance.post(
    "",
    {
      order_id: orderId,
      payment_key: paymentKey,
      price: amount,
      order_name: orderName,
      product_name: productName
    },
    { timeout: 10000 }
  );
}

type PurchaseHistoryResponse = {
  token_purchases: PurchaseHistory[];
  total_page_count: number;
};
function getPurchaseHistory({
  page,
  size = 10
}: {
  page: number;
  size?: number;
}): Promise<CamelCasedProperties<PurchaseHistoryResponse>> {
  return purchaseInstance
    .get<PurchaseHistoryResponse>("", {
      timeout: 10000,
      params: { page, size }
    })
    .then((res) => res.data)
    .then(mapToCamelCase);
}

function getRefundReasons(): Promise<CamelCasedProperties<RefundReason>[]> {
  return purchaseInstance
    .get<RefundReason[]>("/refund-reasons", { timeout: 3000 })
    .then((res) => res.data.map(mapToCamelCase));
}

function requestRefund({
  purchaseId,
  refundReasonCode,
  refundReasonText
}: {
  purchaseId: number;
  refundReasonCode: RefundCode;
  refundReasonText?: string;
}) {
  const body: {
    refund_reason_code: RefundCode;
    refund_reason_text?: string;
  } = {
    refund_reason_code: refundReasonCode
  };
  if (refundReasonText) {
    body.refund_reason_text = refundReasonText;
  }
  return purchaseInstance
    .patch(`/${purchaseId}/refund`, body, { timeout: 3000 })
    .catch((error) => {
      if (isAxiosError(error)) {
        throw new Error(
          error.response?.data.message ?? "서버 오류가 발생했습니다."
        );
      }
      throw new Error("서버 오류가 발생했습니다.");
    });
}

export {
  purchaseToken,
  getProducts,
  getPurchaseHistory,
  getRefundReasons,
  requestRefund
};
