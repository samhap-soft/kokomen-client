import { Handle, NodeProps, Position } from "@xyflow/react";
import { JSX, memo } from "react";
import { cn } from "../../../utils";
import { BlockNode as BlockNodeType, getBlockKindLabel } from "./diagramModel";

/** 보기 전용 캔버스(data-readonly)에서는 연결점을 숨겨 편집할 수 있는 것처럼 보이지 않게 한다 */
const HANDLE_CLASS_NAME: string =
  "!size-2.5 !border-2 !border-bg-base !bg-primary group-data-[readonly=true]/diagram:!opacity-0";

/**
 * 다이어그램 블록. 이름 · 종류 · 속성(키-값)을 보여준다.
 *
 * 네 면에 연결점을 두고 ConnectionMode.Loose 로 어느 점끼리든 잇게 한다.
 * 연결선은 항상 블록 두 개 사이에만 생기므로 source → target 방향을 그대로 쓸 수 있다.
 * 사용자 입력은 텍스트로만 렌더한다(HTML 로 해석하지 않는다).
 */
function BlockNodeComponent({
  data,
  selected
}: NodeProps<BlockNodeType>): JSX.Element {
  const kindLabel = getBlockKindLabel(data.kind);
  return (
    <div
      className={cn(
        "flex w-44 flex-col gap-1.5 rounded-xl border bg-bg-base px-3 py-2.5 shadow-sm",
        selected ? "border-primary ring-2 ring-primary/30" : "border-border"
      )}
    >
      <Handle type="source" position={Position.Top} id="top" className={HANDLE_CLASS_NAME} />
      <Handle type="source" position={Position.Right} id="right" className={HANDLE_CLASS_NAME} />
      <Handle type="source" position={Position.Bottom} id="bottom" className={HANDLE_CLASS_NAME} />
      <Handle type="source" position={Position.Left} id="left" className={HANDLE_CLASS_NAME} />
      <span className="self-start rounded-md bg-primary-bg-light px-1.5 py-0.5 text-[11px] font-semibold text-primary-text">
        {data.kind === "CUSTOM" ? "직접 추가" : kindLabel}
      </span>
      <p className="truncate text-sm font-semibold text-text-primary">
        {data.label || kindLabel}
      </p>
      {data.props.length > 0 && (
        <dl className="flex flex-col gap-0.5 text-xs text-text-secondary">
          {data.props.map((prop, index) => (
            <div key={`${prop.key}-${index}`} className="flex gap-1">
              <dt className="shrink-0 font-medium">{prop.key}:</dt>
              <dd className="truncate">{prop.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

// eslint-disable-next-line @rushstack/typedef-var
export const BlockNode = memo(BlockNodeComponent);
