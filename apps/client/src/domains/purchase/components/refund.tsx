import { useModal } from "@kokomen/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getRefundReasons, requestRefund } from "../api";
import { Button, Input, Modal, RoundSpinner } from "@kokomen/ui";
import { CamelCasedProperties, RefundReason } from "@kokomen/types";
import { Dispatch, SetStateAction, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import z from "zod";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";

export default function Refund({ purchaseId }: { purchaseId: number }) {
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedReason, setSelectedReason] =
    useState<CamelCasedProperties<RefundReason> | null>(null);

  return (
    <>
      <Button variant="text" onClick={openModal} type="button" danger>
        환불하기
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setSelectedReason(null);
          closeModal();
        }}
        title="환불하기"
        size="xl"
      >
        {selectedReason ? (
          <ReasonForm
            purchaseId={purchaseId}
            selectedReason={selectedReason}
            modalClose={closeModal}
            setSelectedReason={setSelectedReason}
          />
        ) : (
          <RefundModal setSelectedReason={setSelectedReason} />
        )}
      </Modal>
    </>
  );
}

function RefundModal({
  setSelectedReason
}: {
  setSelectedReason: Dispatch<
    SetStateAction<CamelCasedProperties<RefundReason> | null>
  >;
}) {
  const {
    data: refundReasons,
    isError,
    isPending
  } = useQuery({
    queryKey: ["refundReasons"],
    queryFn: () => getRefundReasons(),
    retry: false,
    gcTime: 24 * 60 * 60 * 1000,
    staleTime: 24 * 60 * 60 * 1000
  });

  return (
    <div className="flex flex-col gap-4">
      {isError && <div className="text-center">서버 오류가 발생했습니다.</div>}
      {isPending && <RoundSpinner />}
      {refundReasons && (
        <div className="space-y-2.5">
          <p>환불하시는 이유를 선택해주세요.</p>
          {refundReasons?.map((reason) => (
            <>
              <Button
                variant={"softWarning"}
                key={reason.code}
                onClick={() => {
                  setSelectedReason(
                    reason as CamelCasedProperties<RefundReason>
                  );
                }}
              >
                {reason.message}
              </Button>
            </>
          ))}
        </div>
      )}
    </div>
  );
}

const refundReasonSchema = z.object({
  reason: z.string().min(1, { message: "환불 이유를 적어주세요." })
});
function ReasonForm({
  purchaseId,
  selectedReason,
  setSelectedReason,
  modalClose
}: {
  purchaseId: number;
  selectedReason: CamelCasedProperties<RefundReason>;
  setSelectedReason: Dispatch<
    SetStateAction<CamelCasedProperties<RefundReason> | null>
  >;
  modalClose: () => void;
}) {
  const reasonForm = useForm({
    resolver: standardSchemaResolver(refundReasonSchema),
    defaultValues: {
      reason: ""
    }
  });
  const {
    mutate: requestRefundMutation,
    isPending: isRequestRefundPending,
    isSuccess: isRequestRefundSuccess,
    error: requestRefundError
  } = useMutation({
    mutationFn: ({ refundReasonText }: { refundReasonText: string }) =>
      requestRefund({
        purchaseId,
        refundReasonCode: selectedReason.code,
        refundReasonText
      })
  });

  if (isRequestRefundPending) {
    return (
      <div className="text-center flex flex-col items-center gap-4 h-36 justify-center">
        <RoundSpinner />
        <p>환불 요청을 처리하고 있어요</p>
      </div>
    );
  }

  if (requestRefundError) {
    return (
      <div className="text-center">
        <p>{requestRefundError.message}</p>
        <Button
          variant={"primary"}
          size={"large"}
          onClick={() => {
            setSelectedReason(null);
            modalClose();
          }}
          className="w-full mt-4"
        >
          확인
        </Button>
      </div>
    );
  }

  if (isRequestRefundSuccess) {
    return (
      <div className="text-center">
        <p>환불 처리가 완료되었습니다.</p>
        <Button
          onClick={() => {
            setSelectedReason(null);
            modalClose();
          }}
        >
          확인
        </Button>
      </div>
    );
  }

  const onSubmit = (data: z.infer<typeof refundReasonSchema>) => {
    requestRefundMutation({
      refundReasonText: data.reason
    });
  };

  if (selectedReason.requiresReasonText) {
    return (
      <div className="flex flex-col gap-4">
        <form
          className="flex flex-col gap-4"
          onSubmit={reasonForm.handleSubmit(onSubmit as SubmitHandler<unknown>)}
        >
          <p>환불하시는 이유를 적어주세요.</p>
          <Input
            {...reasonForm.register("reason")}
            placeholder="환불 이유를 적어주세요."
            className="text-text-heading"
          />
          {reasonForm.formState.errors.reason?.message && (
            <p className="text-red-500 text-start">
              {reasonForm.formState.errors.reason.message as string}
            </p>
          )}
          <Button
            type="submit"
            size={"large"}
            variant="warning"
            disabled={isRequestRefundPending}
          >
            환불하기
          </Button>
        </form>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4 w-full">
      <p>한번 환불하면 되돌릴 수 없어요. 환불하시겠어요?</p>
      <div className="flex gap-4 w-full">
        <Button
          type="button"
          size={"large"}
          variant={"soft"}
          onClick={() => {
            modalClose();
            setSelectedReason(null);
          }}
          className="flex-1"
        >
          취소
        </Button>
        <Button
          type="button"
          size={"large"}
          variant={"softWarning"}
          className="flex-1"
          onClick={() => {
            requestRefundMutation({
              refundReasonText: ""
            });
          }}
        >
          환불하기
        </Button>
      </div>
    </div>
  );
}
