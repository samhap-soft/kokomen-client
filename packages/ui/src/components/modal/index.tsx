import { cn } from "#utils/index.ts";

interface ModalProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "size" | "children" | "dangerouslySetInnerHTML"
  > {
  ref?: React.Ref<HTMLDivElement>;
  children?: React.ReactNode;
  visible: boolean;
}
export const Modal = ({
  ref,
  children,
  className,
  visible,
  ...props
}: ModalProps) => {
  return (
    <div
      className={cn(`fixed inset-0 z-50`, !visible && "hidden", className)}
      ref={ref}
      {...props}
    >
      <div className="flex items-center justify-center bg-black/50 w-full h-full">
        {children}
      </div>
    </div>
  );
};
