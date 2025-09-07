import { purchaseToken } from "@/domains/purchase/api";
import PurchaseFailed from "@/domains/purchase/components/purchaseFailed";
import { LoadingCircles } from "@kokomen/ui";
import { useMutation } from "@tanstack/react-query";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PurchaseConfirmPage({
  orderId,
  paymentKey,
  amount,
  orderName,
  productName
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const { isError, mutate } = useMutation({
    mutationFn: purchaseToken,
    onSuccess: () => {
      router.replace(`/purchase?purchaseSuccess=true`, { scroll: false });
    }
  });

  useEffect(() => {
    if (orderId && paymentKey && amount && orderName && productName) {
      mutate({
        orderId: orderId as string,
        paymentKey: paymentKey as string,
        amount: Number(amount),
        orderName: orderName as string,
        productName: productName as string
      });
    }
  }, [orderId, paymentKey, amount, orderName, productName, mutate]);

  if (isError) return <PurchaseFailed />;
  return (
    <main className="container mx-auto min-h-screen flex items-center justify-center flex-col gap-4">
      <LoadingCircles size="lg" />
      <p className="text-lg font-bold">결제를 처리하고 있어요</p>
    </main>
  );
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext<{
    orderId: string;
    paymentKey: string;
    amount: string;
    orderName: string;
    productName: string;
  }>
) => {
  const { orderId, paymentKey, amount, orderName, productName } = context.query;
  return {
    props: { orderId, paymentKey, amount, orderName, productName }
  };
};
