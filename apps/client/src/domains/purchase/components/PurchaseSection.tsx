import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { CamelCasedProperties, Product, UserInfo } from "@kokomen/types";
import { Token } from "@kokomen/ui/domains";
import { useState, JSX } from "react";
import { Button } from "@kokomen/ui";
import {
  ANONYMOUS,
  loadTossPayments,
  TossPaymentsWidgets
} from "@tosspayments/tosspayments-sdk";

export default function PurchaseSection({
  userInfo,
  products
}: {
  userInfo: UserInfo;
  products: CamelCasedProperties<Product>[];
}) {
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
    <section className="container mx-auto p-6 flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">토큰 구매</h1>
        <p className="text-sm text-gray-500">
          면접에 필요한 토큰을 구매할 수 있어요.
        </p>
      </div>
      <div className="bg-primary-bg rounded-md p-4">
        <p className="font-bold">토큰 구매 시 주의 사항</p>
        <ul className="text-gray-500 p-4">
          <li>• 텍스트 면접은 질문당 1개가 부과돼요.</li>
          <li>• 음성 면접은 질문당 2개가 부과돼요.</li>
          <li>• 토큰은 구매 후 즉시 적용돼요.</li>
          <li>• 토큰 구매 후 사용한 뒤에는 환불이 어려워요.</li>
        </ul>
      </div>
      <p className=" border border-primary rounded-md p-4">
        내 현재 토큰 : {userInfo?.token_count}개
      </p>
      <div className="flex flex-col gap-4">
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
}) {
  const tossPaymentsWidgets = useRef<TossPaymentsWidgets | null>(null);
  useEffect(() => {
    const fetchTossPayments = async () => {
      const tossPayments = await loadTossPayments(
        "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm"
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

  const handlePurchase = () => {
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
    <section className="container mx-auto p-10 flex flex-col gap-8">
      <div id="tosspayments-payment-methods-container" />
      <div id="tosspayments-agreement-container" />
      <div className="flex justify-center gap-4 w-full">
        <Button
          variant={"outline"}
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
          className="flex-1"
        >
          구매
        </Button>
      </div>
    </section>
  );
}
