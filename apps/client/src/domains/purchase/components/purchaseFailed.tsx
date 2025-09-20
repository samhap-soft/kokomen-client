import { Button } from "@kokomen/ui";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { JSX } from "react";

export default function PurchaseFailed(): JSX.Element {
  const router = useRouter();
  return (
    <main className="container mx-auto min-h-screen flex items-center justify-center flex-col gap-4">
      <Image src="/sad.svg" alt="sad" width={300} height={300} />
      <h1 className="text-2xl font-bold">결제에 실패했어요</h1>
      <p className="text-lg">잠시 후 다시 시도해주세요</p>
      <Button
        variant="gradient"
        size={"large"}
        onClick={() => router.replace("/purchase")}
        className="w-1/2"
      >
        돌아가기
      </Button>
    </main>
  );
}
