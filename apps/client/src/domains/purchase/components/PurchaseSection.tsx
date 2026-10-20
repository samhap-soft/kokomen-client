import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { CamelCasedProperties, Product, UserInfo } from "@kokomen/types";
import { Token } from "@kokomen/ui/domains";
import { useState, JSX } from "react";
import { Button, buttonVariants } from "@kokomen/ui";
import {
  ANONYMOUS,
  loadTossPayments,
  TossPaymentsWidgets
} from "@tosspayments/tosspayments-sdk";
import Link from "next/link";

export default function PurchaseSection({
  userInfo,
  products
}: {
  userInfo: UserInfo;
  products: CamelCasedProperties<Product>[];
}): JSX.Element {
  const [selectedItem, setSelectedItem] =
    useState<CamelCasedProperties<Product> | null>(null);
  if (selectedItem)
    return (
      <PurchaseMode
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
      />
    );
  return (
    <SelectItem
      setSelectedItem={setSelectedItem}
      userInfo={userInfo}
      products={products}
    />
  );
}

function SelectItem({
  setSelectedItem,
  userInfo,
  products
}: {
  // eslint-disable-next-line no-unused-vars
  setSelectedItem: Dispatch<
    SetStateAction<CamelCasedProperties<Product> | null>
  >;
  userInfo: UserInfo;
  products: CamelCasedProperties<Product>[];
}): JSX.Element {
  return (
    <section className="mx-auto flex w-full max-w-[1182px] flex-col gap-8 px-5 pt-8 pb-[100px] xl:px-0">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-lg font-semibold text-text-primary">토큰 구매</h1>
          <p className="text-base font-medium text-text-secondary">
            필요한 만큼 충전하고, 다음 면접을 준비해 보세요.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-3 rounded-[20px] bg-primary-1 p-7">
            <p className="text-base font-medium text-text-secondary">
              내 보유 토큰
            </p>
            <div className="flex flex-col gap-1">
              <p className="text-2xl font-semibold text-text-primary">
                {(userInfo?.token_count ?? 0).toLocaleString()}개
              </p>
              <p className="text-sm text-text-secondary">
                구매한 토큰은 즉시 적용돼요.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-5 rounded-[20px] border border-border bg-bg-elevated p-7">
            <p className="text-xl font-semibold text-text-primary">
              토큰은 이렇게 사용돼요
            </p>
            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-text-secondary">텍스트 면접</dt>
                <dd className="font-semibold text-text-primary">질문당 1개</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-text-secondary">음성 면접</dt>
                <dd className="font-semibold text-text-primary">질문당 2개</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-text-primary">
            구매할 토큰을 골라주세요
          </h2>
          <div className="flex flex-col gap-2">
            {products &&
              products.length > 0 &&
              products.map((product) => (
                <Token
                  key={`token-${product.productName}`}
                  {...product}
                  onPurchase={() =>
                    setSelectedItem({
                      orderName: product.orderName,
                      price: product.price,
                      productName: product.productName
                    })
                  }
                />
              ))}
          </div>
        </div>
        <div className="flex flex-col items-start gap-2.5 border-t border-border p-7">
          <div className="flex flex-col gap-1 text-sm">
            <p className="font-semibold text-text-primary">
              구매 전 확인해 주세요
            </p>
            <p className="text-text-secondary">
              구매한 토큰을 사용한 뒤에는 환불이 어려우며, 상품의 최대 이용
              기간은 1년입니다. 구매 전 환불 규정을 확인해 주세요.
            </p>
          </div>
          <Link
            target="_blank"
            href="/terms/termsofuse#refund-policy"
            className={buttonVariants({ variant: "secondary" })}
          >
            환불 규정 확인
          </Link>
        </div>
      </div>
    </section>
  );
}

function PurchaseMode({
  selectedItem,
  setSelectedItem
}: {
  selectedItem: CamelCasedProperties<Product>;
  setSelectedItem: Dispatch<
    SetStateAction<CamelCasedProperties<Product> | null>
  >;
}): JSX.Element {
  const tossPaymentsWidgets = useRef<TossPaymentsWidgets | null>(null);
  useEffect(() => {
    const fetchTossPayments = async (): Promise<void> => {
      const tossPayments = await loadTossPayments(
        (process.env.NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY as string) || ""
      );
      const widgets = tossPayments.widgets({
        customerKey: ANONYMOUS
      });
      await widgets.setAmount({ currency: "KRW", value: selectedItem.price });
      await Promise.all([
        widgets.renderPaymentMethods({
          selector: "#tosspayments-payment-methods-container"
        }),
        widgets.renderAgreement({
          selector: "#tosspayments-agreement-container"
        })
      ]);
      tossPaymentsWidgets.current = widgets;
    };
    fetchTossPayments().catch(console.error);
  }, [selectedItem.price]);

  const handlePurchase = (): void => {
    tossPaymentsWidgets.current
      ?.requestPayment({
        orderId: crypto.randomUUID(),
        orderName: selectedItem.orderName,
        successUrl: `${window.location.origin}/purchase/confirm?productName=${selectedItem.productName}&orderName=${selectedItem.orderName}`,
        failUrl: `${window.location.origin}/purchase/error`
      })
      .catch(console.error);
  };

  return (
    <section className="mx-auto flex w-full max-w-[1182px] flex-col gap-8 px-5 pt-8 pb-[100px] xl:px-0">
      <div id="tosspayments-payment-methods-container" />
      <div id="tosspayments-agreement-container" />
      <div className="flex justify-center gap-4 w-full">
        <Button
          variant={"secondary"}
          size={"large"}
          onClick={() => setSelectedItem(null)}
          className="flex-1"
        >
          취소
        </Button>
        <Button
          variant={"primary"}
          size={"large"}
          onClick={handlePurchase}
          className="flex-1 font-bold"
        >
          구매
        </Button>
      </div>
    </section>
  );
}
