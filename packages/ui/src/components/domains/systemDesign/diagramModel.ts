import type {
  DiagramBlock,
  DiagramBlockKind,
  DiagramBlockProp,
  DiagramConnection,
  SystemDesignDiagram
} from "@kokomen/types";
import type { Edge, Node } from "@xyflow/react";

/**
 * 다이어그램 입력 상한. 서버도 같은 값으로 검증해야 한다(API 초안).
 * LLM 프롬프트에 들어가는 입력이라 크기를 묶어 둔다.
 */
export const DIAGRAM_LIMITS = {
  maxBlocks: 30,
  maxConnections: 60,
  maxLabelLength: 40,
  maxProps: 8,
  maxPropKeyLength: 20,
  maxPropValueLength: 40
} as const;

export type BlockKindOption = {
  kind: DiagramBlockKind;
  label: string;
};

/** 팔레트 순서 = 화면 순서 */
export const BLOCK_KIND_OPTIONS: readonly BlockKindOption[] = [
  { kind: "CLIENT", label: "Client" },
  { kind: "LOAD_BALANCER", label: "Load Balancer" },
  { kind: "API_SERVER", label: "API Server" },
  { kind: "DB", label: "DB" },
  { kind: "CACHE", label: "Cache" },
  { kind: "QUEUE", label: "Queue" },
  { kind: "STORAGE", label: "Storage" },
  { kind: "CDN", label: "CDN" },
  { kind: "CUSTOM", label: "직접 추가" }
];

export const getBlockKindLabel = (kind: DiagramBlockKind): string =>
  BLOCK_KIND_OPTIONS.find((option) => option.kind === kind)?.label ?? kind;

export type BlockNodeData = {
  kind: DiagramBlockKind;
  label: string;
  props: DiagramBlockProp[];
};

export type BlockNode = Node<BlockNodeData, "block">;

export const clampText = (value: string, maxLength: number): string =>
  value.slice(0, maxLength);

export const toFlowNodes = (blocks: DiagramBlock[]): BlockNode[] =>
  blocks.map((block) => ({
    id: block.id,
    type: "block",
    position: block.position,
    data: { kind: block.kind, label: block.label, props: block.props }
  }));

type HandleId = "top" | "right" | "bottom" | "left";

/**
 * 저장 형식에는 연결점(handle) 정보가 없다. 불러올 때 두 블록의 위치를 보고
 * 가까운 면끼리 잇는다. 사용자가 직접 이은 연결은 React Flow 가 고른 점을 그대로 쓴다.
 */
const pickHandles = (
  source: { x: number; y: number } | undefined,
  target: { x: number; y: number } | undefined
): { sourceHandle: HandleId; targetHandle: HandleId } => {
  if (!source || !target) return { sourceHandle: "right", targetHandle: "left" };
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0
      ? { sourceHandle: "right", targetHandle: "left" }
      : { sourceHandle: "left", targetHandle: "right" };
  }
  return dy >= 0
    ? { sourceHandle: "bottom", targetHandle: "top" }
    : { sourceHandle: "top", targetHandle: "bottom" };
};

export const toFlowEdges = (
  connections: DiagramConnection[],
  blocks: DiagramBlock[]
): Edge[] => {
  const positionById = new Map(blocks.map((block) => [block.id, block.position]));
  return connections.map((connection) => ({
    id: connection.id,
    source: connection.source,
    target: connection.target,
    ...pickHandles(
      positionById.get(connection.source),
      positionById.get(connection.target)
    ),
    label: connection.label || undefined
  }));
};

/**
 * 화면 상태(선택, 크기, viewport)를 버리고 저장 · 제출용 형식으로 바꾼다.
 * 빈 속성 키와 끊어진 연결은 넣지 않는다.
 */
export const toDiagram = (
  nodes: BlockNode[],
  edges: Edge[]
): SystemDesignDiagram => {
  const blockIds = new Set(nodes.map((node) => node.id));
  return {
    blocks: nodes.map((node) => ({
      id: node.id,
      kind: node.data.kind,
      label: node.data.label.trim() || getBlockKindLabel(node.data.kind),
      props: node.data.props.filter((prop) => prop.key.trim().length > 0),
      position: {
        x: Math.round(node.position.x),
        y: Math.round(node.position.y)
      }
    })),
    connections: edges
      .filter((edge) => blockIds.has(edge.source) && blockIds.has(edge.target))
      .map((edge) => {
        const label = typeof edge.label === "string" ? edge.label.trim() : "";
        return {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          ...(label ? { label } : {})
        };
      })
  };
};

export const EMPTY_DIAGRAM: SystemDesignDiagram = {
  blocks: [],
  connections: []
};

let idSequence = 0;
/** 브라우저 세션 안에서만 겹치지 않으면 된다. 서버는 id 를 그대로 저장한다. */
export const createBlockId = (): string => {
  idSequence += 1;
  return `b${Date.now().toString(36)}${idSequence}`;
};
