import type { Meta, StoryObj } from "@storybook/react";
import { Toaster, useToast, ToastAction } from "./index";
import { Button } from "../button";

const meta: Meta<typeof Toaster> = {
  title: "Components/Toast",
  component: Toaster,
  parameters: {
    layout: "centered"
  },
  tags: ["autodocs"]
};

export default meta;
type Story = StoryObj<typeof meta>;

// Toast 데모 컴포넌트
const ToastDemo = () => {
  const { toast, success, error, warning, info } = useToast();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() =>
            toast({
              title: "기본 토스트",
              description: "이것은 기본 토스트 메시지입니다."
            })
          }
        >
          기본 토스트
        </Button>

        <Button
          onClick={() =>
            success({
              title: "성공!",
              description: "작업이 성공적으로 완료되었습니다."
            })
          }
        >
          성공 토스트
        </Button>

        <Button
          onClick={() =>
            error({
              title: "오류 발생",
              description: "작업 중 오류가 발생했습니다."
            })
          }
        >
          오류 토스트
        </Button>

        <Button
          onClick={() =>
            warning({
              title: "경고",
              description: "주의가 필요한 상황입니다."
            })
          }
        >
          경고 토스트
        </Button>

        <Button
          onClick={() =>
            info({
              title: "정보",
              description: "유용한 정보를 제공합니다."
            })
          }
        >
          정보 토스트
        </Button>
      </div>
    </div>
  );
};

export const Default: Story = {
  render: () => (
    <Toaster>
      <ToastDemo />
    </Toaster>
  )
};

export const WithActions: Story = {
  render: () => {
    const ToastWithActions = () => {
      const { toast } = useToast();

      return (
        <div className="space-y-4">
          <Button
            onClick={() =>
              toast({
                title: "업데이트 완료",
                description: "파일이 성공적으로 업로드되었습니다.",
                action: (
                  <ToastAction onClick={() => console.log("실행 취소")}>
                    실행 취소
                  </ToastAction>
                )
              })
            }
          >
            액션 포함 토스트
          </Button>

          <Button
            onClick={() =>
              toast({
                title: "네트워크 오류",
                description: "인터넷 연결을 확인해주세요.",
                action: (
                  <ToastAction onClick={() => console.log("다시 시도")}>
                    다시 시도
                  </ToastAction>
                ),
                variant: "error"
              })
            }
          >
            오류 + 액션 토스트
          </Button>
        </div>
      );
    };

    return (
      <Toaster>
        <ToastWithActions />
      </Toaster>
    );
  }
};

export const CustomDuration: Story = {
  render: () => {
    const ToastWithCustomDuration = () => {
      const { toast } = useToast();

      return (
        <div className="space-y-4">
          <Button
            onClick={() =>
              toast({
                title: "짧은 토스트",
                description: "2초 후 자동으로 사라집니다.",
                duration: 2000
              })
            }
          >
            짧은 토스트 (2초)
          </Button>

          <Button
            onClick={() =>
              toast({
                title: "긴 토스트",
                description: "10초 후 자동으로 사라집니다.",
                duration: 10000
              })
            }
          >
            긴 토스트 (10초)
          </Button>

          <Button
            onClick={() =>
              toast({
                title: "수동 닫기 토스트",
                description: "수동으로 닫을 때까지 유지됩니다.",
                duration: Infinity
              })
            }
          >
            수동 닫기 토스트
          </Button>
        </div>
      );
    };

    return (
      <Toaster>
        <ToastWithCustomDuration />
      </Toaster>
    );
  }
};

export const AllVariants: Story = {
  render: () => {
    const AllVariantsDemo = () => {
      const { toast, success, error, warning, info } = useToast();

      const showAllToasts = () => {
        toast({
          title: "기본 토스트",
          description: "기본 스타일의 토스트 메시지입니다."
        });

        setTimeout(() => {
          success({
            title: "성공 메시지",
            description: "작업이 성공적으로 완료되었습니다."
          });
        }, 500);

        setTimeout(() => {
          error({
            title: "오류 메시지",
            description: "작업 중 오류가 발생했습니다."
          });
        }, 1000);

        setTimeout(() => {
          warning({
            title: "경고 메시지",
            description: "주의가 필요한 상황입니다."
          });
        }, 1500);

        setTimeout(() => {
          info({
            title: "정보 메시지",
            description: "유용한 정보를 제공합니다."
          });
        }, 2000);
      };

      return <Button onClick={showAllToasts}>모든 변형 토스트 표시</Button>;
    };

    return (
      <Toaster>
        <AllVariantsDemo />
      </Toaster>
    );
  }
};

export const ComplexContent: Story = {
  render: () => {
    const ComplexContentDemo = () => {
      const { toast } = useToast();

      return (
        <div className="space-y-4">
          <Button
            onClick={() =>
              toast({
                title: "복잡한 토스트",
                description: (
                  <div className="space-y-2">
                    <p>여러 줄의 내용을 포함할 수 있습니다.</p>
                    <ul className="list-disc list-inside text-xs">
                      <li>첫 번째 항목</li>
                      <li>두 번째 항목</li>
                      <li>세 번째 항목</li>
                    </ul>
                  </div>
                ),
                action: (
                  <ToastAction onClick={() => console.log("자세히 보기")}>
                    자세히 보기
                  </ToastAction>
                ),
                variant: "info"
              })
            }
          >
            복잡한 내용 토스트
          </Button>

          <Button
            onClick={() =>
              toast({
                title: "HTML 포함 토스트",
                description: (
                  <div>
                    <strong>굵은 텍스트</strong>와 <em>기울임 텍스트</em>를
                    포함할 수 있습니다.
                    <br />
                    <span className="text-blue-600">색상이 있는 텍스트</span>도
                    가능합니다.
                  </div>
                ),
                variant: "success"
              })
            }
          >
            HTML 포함 토스트
          </Button>
        </div>
      );
    };

    return (
      <Toaster>
        <ComplexContentDemo />
      </Toaster>
    );
  }
};

export const MultipleToasts: Story = {
  render: () => {
    const MultipleToastsDemo = () => {
      const { toast } = useToast();

      const showMultipleToasts = () => {
        // 여러 토스트를 연속으로 표시
        for (let i = 1; i <= 5; i++) {
          setTimeout(() => {
            toast({
              title: `토스트 ${i}`,
              description: `이것은 ${i}번째 토스트 메시지입니다.`,
              variant: i % 2 === 0 ? "success" : "info"
            });
          }, i * 500);
        }
      };

      return <Button onClick={showMultipleToasts}>여러 토스트 표시</Button>;
    };

    return (
      <Toaster>
        <MultipleToastsDemo />
      </Toaster>
    );
  }
};
