import { Button, Modal } from "@kokomen/ui";
import { useModal } from "@kokomen/utils";
import { useRouter, useSearchParams } from "next/navigation";

export default function PurchaseSuccessModal() {
  const searchParams = useSearchParams();
  const { isOpen, closeModal } = useModal(
    searchParams.get("purchaseSuccess") === "true"
  );
  const router = useRouter();
  function deletePurchaseSuccessParam() {
    const urlSearchParams = new URLSearchParams(searchParams);
    urlSearchParams.delete("purchaseSuccess");
    router.replace(`/purchase?${urlSearchParams.toString()}`);
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title="구매 성공"
      size="md"
      backdropClose
    >
      <div className="space-y-2 text-xl text-center">
        <p>구매가 완료됐어요!</p>
        <p>지금 바로 모의 면접에서 활용해보세요!</p>
      </div>
      <Button
        onClick={() => {
          closeModal();
          deletePurchaseSuccessParam();
          router.push("/interviews");
        }}
        className="w-full mt-4"
        size={"large"}
      >
        인터뷰 보러가기
      </Button>
      <Button
        variant={"outline"}
        onClick={() => {
          closeModal();
          deletePurchaseSuccessParam();
        }}
        className="w-full mt-4"
        size={"large"}
      >
        닫기
      </Button>
    </Modal>
  );
}
