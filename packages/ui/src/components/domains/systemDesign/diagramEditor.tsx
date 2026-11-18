import "@xyflow/react/dist/style.css";
import {
  addEdge,
  Background,
  Connection,
  ConnectionMode,
  Controls,
  Edge,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow
} from "@xyflow/react";
import type {
  DiagramBlockKind,
  DiagramBlockProp,
  SystemDesignDiagram
} from "@kokomen/types";
import { JSX, useCallback, useEffect, useMemo, useRef } from "react";
import { cn } from "../../../utils";
import { Button } from "../../button";
import { BlockNode } from "./blockNode";
import {
  BLOCK_KIND_OPTIONS,
  BlockNode as BlockNodeType,
  BlockNodeData,
  clampText,
  createBlockId,
  DIAGRAM_LIMITS,
  getBlockKindLabel,
  toDiagram,
  toFlowEdges,
  toFlowNodes
} from "./diagramModel";

const NODE_TYPES = { block: BlockNode };

const DEFAULT_EDGE_OPTIONS: Partial<Edge> = {
  type: "smoothstep",
  markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18 },
  labelBgPadding: [6, 3],
  labelBgBorderRadius: 6
};

/** 블록 컴포넌트(w-44)의 대략적인 크기. 새 블록이 겹치지 않게 놓을 때만 쓴다 */
const BLOCK_SIZE = { width: 176, height: 80 } as const;

/** 가운데 자리가 차 있으면 대각선으로 비켜 가며 빈 자리를 찾는다 */
const findFreePosition = (
  start: { x: number; y: number },
  nodes: BlockNodeType[]
): { x: number; y: number } => {
  const overlaps = (x: number, y: number): boolean =>
    nodes.some(
      (node) =>
        Math.abs(node.position.x - x) < BLOCK_SIZE.width &&
        Math.abs(node.position.y - y) < BLOCK_SIZE.height
    );
  for (let step = 0; step < 12; step += 1) {
    const candidate = { x: start.x + step * 40, y: start.y + step * 100 };
    if (!overlaps(candidate.x, candidate.y)) return candidate;
  }
  return start;
};

const FIT_VIEW_OPTIONS = { padding: 0.15, maxZoom: 1 } as const;

const inputClassName: string =
  "w-full rounded-lg border border-border bg-bg-base px-2.5 py-1.5 text-sm text-text-primary outline-none placeholder:text-text-placeholder focus:border-primary-border-hover disabled:bg-bg-container-disabled";

export interface DiagramEditorProps {
  /** 처음 그릴 다이어그램(시작 다이어그램 또는 임시 저장본). 바꾸려면 key 를 바꾼다 */
  defaultValue: SystemDesignDiagram;
  // eslint-disable-next-line no-unused-vars
  onChange?: (diagram: SystemDesignDiagram) => void;
  /** 리포트처럼 보기만 할 때 true. 팔레트와 속성 패널을 숨긴다 */
  readOnly?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * 시스템 설계 다이어그램 에디터 (React Flow, MIT).
 *
 * - 팔레트: 정해진 블록 + "직접 추가". 누르면 캔버스에 블록이 생긴다.
 * - 속성 패널: 블록이나 연결선을 선택하면 캔버스 오른쪽에 뜬다.
 *   선택한 블록의 이름 · 종류 · 속성(키-값), 선택한 연결선의 라벨을 고친다.
 *   시작 다이어그램에 있던 블록도 똑같이 고칠 수 있다.
 * - 연결선은 방향이 있고(source → target) 라벨은 선택이다.
 * - Delete / Backspace 로 선택한 블록이나 연결을 지운다(입력창에서는 동작하지 않는다).
 *
 * 화면 상태(viewport, 선택)는 onChange 로 내보내지 않는다.
 */
export function DiagramEditor(props: DiagramEditorProps): JSX.Element {
  return (
    <ReactFlowProvider>
      <DiagramEditorInner {...props} />
    </ReactFlowProvider>
  );
}

function DiagramEditorInner({
  defaultValue,
  onChange,
  readOnly = false,
  disabled = false,
  className
}: DiagramEditorProps): JSX.Element {
  const [nodes, setNodes, onNodesChange] = useNodesState<BlockNodeType>(
    toFlowNodes(defaultValue.blocks)
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(
    toFlowEdges(defaultValue.connections, defaultValue.blocks)
  );
  const isEditable = !readOnly && !disabled;
  const { screenToFlowPosition, fitView } = useReactFlow();
  const canvasRef = useRef<HTMLDivElement>(null);
  const hasUserMovedRef = useRef<boolean>(false);

  /**
   * 첫 fitView 는 캔버스 크기가 정해지기 전에 돌 수 있다(동적 로딩 · 레이아웃 이동).
   * 사용자가 직접 화면을 옮기기 전까지는 크기가 바뀔 때마다 다시 맞춘다.
   */
  useEffect(() => {
    const element = canvasRef.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      if (hasUserMovedRef.current) return;
      fitView(FIT_VIEW_OPTIONS).catch(() => {});
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [fitView]);

  // 부모가 매 렌더 새 함수를 넘겨도 effect 가 다시 돌지 않게 ref 로 들고 있는다
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // 선택 · 드래그 중간 상태는 걸러지도록 저장 형식으로 바꾼 뒤 비교한다
  const diagram = useMemo(() => toDiagram(nodes, edges), [nodes, edges]);
  const serialized = JSON.stringify(diagram);
  const lastEmittedRef = useRef<string>(serialized);
  useEffect(() => {
    if (readOnly || serialized === lastEmittedRef.current) return;
    lastEmittedRef.current = serialized;
    onChangeRef.current?.(diagram);
  }, [serialized, diagram, readOnly]);

  const selectedNode = nodes.find((node) => node.selected);
  const selectedEdge = selectedNode
    ? undefined
    : edges.find((edge) => edge.selected);

  /** 지금 보이는 캔버스 가운데 좌표(블록 왼쪽 위 기준) */
  const getVisibleCenter = useCallback((): { x: number; y: number } => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const center = screenToFlowPosition({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    });
    return { x: center.x - BLOCK_SIZE.width / 2, y: center.y - BLOCK_SIZE.height / 2 };
  }, [screenToFlowPosition]);

  const addBlock = useCallback(
    (kind: DiagramBlockKind) => {
      const center = getVisibleCenter();
      setNodes((current) => {
        if (current.length >= DIAGRAM_LIMITS.maxBlocks) return current;
        const position = findFreePosition(center, current);
        const label = kind === "CUSTOM" ? "새 블록" : getBlockKindLabel(kind);
        const next: BlockNodeType = {
          id: createBlockId(),
          type: "block",
          position,
          data: { kind, label, props: [] },
          selected: true
        };
        return [
          ...current.map((node) => ({ ...node, selected: false })),
          next
        ];
      });
      setEdges((current) =>
        current.map((edge) => ({ ...edge, selected: false }))
      );
    },
    [getVisibleCenter, setNodes, setEdges]
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      // 자기 자신 연결과 같은 방향 중복 연결은 의미가 없어 막는다
      if (connection.source === connection.target) return;
      setEdges((current) => {
        if (current.length >= DIAGRAM_LIMITS.maxConnections) return current;
        const isDuplicate = current.some(
          (edge) =>
            edge.source === connection.source &&
            edge.target === connection.target
        );
        if (isDuplicate) return current;
        return addEdge(
          { ...connection, id: `e${createBlockId()}` },
          current
        );
      });
    },
    [setEdges]
  );

  const updateNodeData = useCallback(
    (nodeId: string, updates: Partial<BlockNodeData>) => {
      setNodes((current) =>
        current.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...updates } }
            : node
        )
      );
    },
    [setNodes]
  );

  const updateEdge = useCallback(
    (edgeId: string, updates: Partial<Edge>) => {
      setEdges((current) =>
        current.map((edge) =>
          edge.id === edgeId ? { ...edge, ...updates } : edge
        )
      );
    },
    [setEdges]
  );

  const removeNode = useCallback(
    (nodeId: string) => {
      setNodes((current) => current.filter((node) => node.id !== nodeId));
      setEdges((current) =>
        current.filter(
          (edge) => edge.source !== nodeId && edge.target !== nodeId
        )
      );
    },
    [setNodes, setEdges]
  );

  const removeEdge = useCallback(
    (edgeId: string) => {
      setEdges((current) => current.filter((edge) => edge.id !== edgeId));
    },
    [setEdges]
  );

  const labelById = useMemo(
    () => new Map(nodes.map((node) => [node.id, node.data.label])),
    [nodes]
  );

  const hasSelection = Boolean(selectedNode || selectedEdge);

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col gap-2", className)}>
      {isEditable && (
        <BlockPalette
          onAdd={addBlock}
          isFull={nodes.length >= DIAGRAM_LIMITS.maxBlocks}
        />
      )}
      <div
        ref={canvasRef}
        data-readonly={!isEditable}
        className="group/diagram relative min-h-[360px] flex-1 overflow-hidden rounded-xl border border-border bg-bg-base"
        aria-label="시스템 설계 다이어그램"
        role="group"
      >
        <ReactFlow<BlockNodeType, Edge>
          nodes={nodes}
          edges={edges}
          nodeTypes={NODE_TYPES}
          onNodesChange={isEditable ? onNodesChange : undefined}
          onEdgesChange={isEditable ? onEdgesChange : undefined}
          onConnect={isEditable ? handleConnect : undefined}
          connectionMode={ConnectionMode.Loose}
          defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
          nodesDraggable={isEditable}
          nodesConnectable={isEditable}
          elementsSelectable={isEditable}
          deleteKeyCode={isEditable ? ["Delete", "Backspace"] : null}
          fitView
          fitViewOptions={FIT_VIEW_OPTIONS}
          onMoveStart={(event) => {
            // 프로그램이 맞춘 이동(fitView)은 event 가 없다. 사용자 조작만 기록한다
            if (event) hasUserMovedRef.current = true;
          }}
          minZoom={0.3}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={20} size={1} />
          <Controls showInteractive={false} />
        </ReactFlow>
        {nodes.length === 0 && (
          <p className="pointer-events-none absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-text-tertiary">
            {isEditable
              ? "위 팔레트에서 블록을 추가하고, 블록 테두리의 점을 끌어 다른 블록과 이어 보세요."
              : "그린 다이어그램이 없어요."}
          </p>
        )}
        {isEditable && hasSelection && (
          <aside
            aria-label="속성 편집"
            className="absolute top-3 right-3 bottom-3 z-10 flex w-[min(18rem,calc(100%-1.5rem))] flex-col gap-3 overflow-y-auto rounded-xl border border-border bg-bg-base p-3 shadow-lg"
          >
            {selectedNode ? (
              <BlockInspector
                key={selectedNode.id}
                data={selectedNode.data}
                onChange={(updates) => updateNodeData(selectedNode.id, updates)}
                onRemove={() => removeNode(selectedNode.id)}
              />
            ) : selectedEdge ? (
              <ConnectionInspector
                key={selectedEdge.id}
                sourceLabel={labelById.get(selectedEdge.source) ?? ""}
                targetLabel={labelById.get(selectedEdge.target) ?? ""}
                label={
                  typeof selectedEdge.label === "string" ? selectedEdge.label : ""
                }
                onLabelChange={(label) =>
                  updateEdge(selectedEdge.id, { label: label || undefined })
                }
                onReverse={() =>
                  updateEdge(selectedEdge.id, {
                    source: selectedEdge.target,
                    target: selectedEdge.source
                  })
                }
                onRemove={() => removeEdge(selectedEdge.id)}
              />
            ) : null}
          </aside>
        )}
      </div>
    </div>
  );
}

function BlockPalette({
  onAdd,
  isFull
}: {
  // eslint-disable-next-line no-unused-vars
  onAdd: (kind: DiagramBlockKind) => void;
  isFull: boolean;
}): JSX.Element {
  return (
    <nav
      aria-label="블록 팔레트"
      className="flex shrink-0 flex-wrap items-center gap-1.5"
    >
      {BLOCK_KIND_OPTIONS.map((option) => (
        <button
          key={option.kind}
          type="button"
          onClick={() => onAdd(option.kind)}
          disabled={isFull}
          aria-label={`${option.label} 블록 추가`}
          className={cn(
            "shrink-0 rounded-lg border px-2.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            option.kind === "CUSTOM"
              ? "border-dashed border-primary-border text-primary-text hover:bg-primary-bg-light-hover"
              : "border-border bg-bg-base text-text-primary hover:bg-fill-tertiary"
          )}
        >
          {option.kind === "CUSTOM" ? "+ 직접 추가" : option.label}
        </button>
      ))}
      {isFull && (
        <p className="text-xs text-text-tertiary">
          블록은 {DIAGRAM_LIMITS.maxBlocks}개까지 만들 수 있어요.
        </p>
      )}
    </nav>
  );
}

function BlockInspector({
  data,
  onChange,
  onRemove
}: {
  data: BlockNodeData;
  // eslint-disable-next-line no-unused-vars
  onChange: (updates: Partial<BlockNodeData>) => void;
  onRemove: () => void;
}): JSX.Element {
  const updateProp = (
    index: number,
    updates: Partial<DiagramBlockProp>
  ): void => {
    onChange({
      props: data.props.map((prop, propIndex) =>
        propIndex === index ? { ...prop, ...updates } : prop
      )
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-text-primary">블록</h3>
      <label className="flex flex-col gap-1 text-xs font-medium text-text-secondary">
        이름
        <input
          className={inputClassName}
          value={data.label}
          maxLength={DIAGRAM_LIMITS.maxLabelLength}
          onChange={(event) =>
            onChange({
              label: clampText(event.target.value, DIAGRAM_LIMITS.maxLabelLength)
            })
          }
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-text-secondary">
        종류
        <select
          className={inputClassName}
          value={data.kind}
          onChange={(event) =>
            onChange({ kind: event.target.value as DiagramBlockKind })
          }
        >
          {BLOCK_KIND_OPTIONS.map((option) => (
            <option key={option.kind} value={option.kind}>
              {option.kind === "CUSTOM" ? "기타(직접 추가)" : option.label}
            </option>
          ))}
        </select>
      </label>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-xs font-medium text-text-secondary">
          속성
        </legend>
        {data.props.map((prop, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <input
              aria-label={`속성 ${index + 1} 이름`}
              placeholder="개수"
              className={inputClassName}
              value={prop.key}
              maxLength={DIAGRAM_LIMITS.maxPropKeyLength}
              onChange={(event) => updateProp(index, { key: event.target.value })}
            />
            <input
              aria-label={`속성 ${index + 1} 값`}
              placeholder="3"
              className={inputClassName}
              value={prop.value}
              maxLength={DIAGRAM_LIMITS.maxPropValueLength}
              onChange={(event) =>
                updateProp(index, { value: event.target.value })
              }
            />
            <button
              type="button"
              aria-label={`속성 ${index + 1} 삭제`}
              onClick={() =>
                onChange({
                  props: data.props.filter((_, propIndex) => propIndex !== index)
                })
              }
              className="shrink-0 rounded-md px-1.5 py-1 text-sm text-text-tertiary hover:bg-fill-tertiary hover:text-text-primary"
            >
              ✕
            </button>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          size="small"
          disabled={data.props.length >= DIAGRAM_LIMITS.maxProps}
          onClick={() =>
            onChange({ props: [...data.props, { key: "", value: "" }] })
          }
          className="self-start"
        >
          속성 추가
        </Button>
      </fieldset>
      <Button
        type="button"
        variant="secondary"
        size="small"
        onClick={onRemove}
        className="self-start text-error"
      >
        블록 삭제
      </Button>
    </div>
  );
}

function ConnectionInspector({
  sourceLabel,
  targetLabel,
  label,
  onLabelChange,
  onReverse,
  onRemove
}: {
  sourceLabel: string;
  targetLabel: string;
  label: string;
  // eslint-disable-next-line no-unused-vars
  onLabelChange: (label: string) => void;
  onReverse: () => void;
  onRemove: () => void;
}): JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-text-primary">연결</h3>
      <p className="text-sm break-all text-text-secondary">
        {sourceLabel} → {targetLabel}
      </p>
      <label className="flex flex-col gap-1 text-xs font-medium text-text-secondary">
        라벨 (선택)
        <input
          className={inputClassName}
          value={label}
          placeholder="예: HTTPS, 읽기, 비동기"
          maxLength={DIAGRAM_LIMITS.maxLabelLength}
          onChange={(event) =>
            onLabelChange(
              clampText(event.target.value, DIAGRAM_LIMITS.maxLabelLength)
            )
          }
        />
      </label>
      <div className="flex gap-2">
        <Button type="button" variant="secondary" size="small" onClick={onReverse}>
          방향 바꾸기
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="small"
          onClick={onRemove}
          className="text-error"
        >
          연결 삭제
        </Button>
      </div>
    </div>
  );
}
