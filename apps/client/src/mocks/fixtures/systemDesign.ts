import type {
  SystemDesignDiagram,
  SystemDesignTopic
} from "@kokomen/types";

/**
 * 시스템 설계 면접 목 데이터. 백엔드가 운영자 등록 데이터(주제 · 숨은 요구사항 ·
 * 평가 포인트 · 시작 다이어그램)를 주기 전까지 화면을 확인하는 데만 쓴다.
 */
export type HiddenRequirement = {
  /** 역질문에 이 단어가 들어 있으면 이 요구사항으로 답한다 */
  keywords: string[];
  /** 리포트의 "놓친 요구사항"에 쓰는 이름 */
  name: string;
  answer: string;
};

export type EvaluationPoint = {
  description: string;
  /** 답변이나 다이어그램 라벨에 하나라도 있으면 충족으로 본다(목 판정) */
  keywords: string[];
};

export type SystemDesignProblem = {
  topic: SystemDesignTopic;
  hiddenRequirements: HiddenRequirement[];
  evaluationPoints: EvaluationPoint[];
  starterDiagram: SystemDesignDiagram;
  highLevelQuestions: string[];
  deepDiveQuestions: string[];
  difficultyComment: string;
};

const URL_SHORTENER: SystemDesignProblem = {
  topic: {
    title: "URL 단축기를 설계해 보세요",
    description:
      "긴 URL 을 짧은 URL 로 바꾸고, 짧은 URL 로 접속하면 원래 주소로 보내는 서비스입니다."
  },
  hiddenRequirements: [
    {
      keywords: ["트래픽", "요청", "사용자", "qps", "QPS", "건"],
      name: "트래픽 규모",
      answer: "하루 단축 URL 생성은 100만 건, 조회는 그 10배라고 가정해 주세요."
    },
    {
      keywords: ["보관", "기간", "만료", "유효"],
      name: "보관 기간",
      answer: "단축 URL 은 기본 5년 보관하고, 사용자가 만료일을 정할 수는 없어요."
    },
    {
      keywords: ["길이", "자리", "짧", "문자"],
      name: "단축 키 길이",
      answer: "단축 키는 7자 이내의 영문 대소문자와 숫자로 만들어 주세요."
    },
    {
      keywords: ["지연", "응답", "속도", "ms", "latency"],
      name: "응답 지연 목표",
      answer: "리다이렉트 응답은 100ms 안에 끝나야 해요."
    },
    {
      keywords: ["커스텀", "사용자 지정", "직접"],
      name: "사용자 지정 별칭",
      answer: "사용자 지정 별칭은 이번 범위에서 빼도 돼요."
    }
  ],
  evaluationPoints: [
    { description: "읽기와 쓰기 비율을 보고 읽기 경로를 따로 최적화했다", keywords: ["캐시", "cache", "Cache", "Redis"] },
    { description: "단축 키 생성 방식(해시 · 카운터)과 충돌 처리를 설명했다", keywords: ["해시", "hash", "Base62", "base62", "충돌", "카운터"] },
    { description: "저장소 선택과 데이터 크기를 추정했다", keywords: ["DB", "MySQL", "NoSQL", "용량", "TB", "GB"] },
    { description: "서버를 수평 확장할 수 있게 상태를 두지 않았다", keywords: ["로드 밸런서", "Load Balancer", "수평", "stateless", "무상태"] }
  ],
  starterDiagram: {
    blocks: [
      { id: "client", kind: "CLIENT", label: "Client", props: [], position: { x: 0, y: 80 } },
      { id: "api", kind: "API_SERVER", label: "API Server", props: [], position: { x: 260, y: 80 } },
      { id: "db", kind: "DB", label: "DB", props: [], position: { x: 520, y: 80 } }
    ],
    connections: [
      { id: "c1", source: "client", target: "api", label: "HTTPS" },
      { id: "c2", source: "api", target: "db" }
    ]
  },
  highLevelQuestions: [
    "확인한 요구사항을 바탕으로 전체 구조를 그리고, 요청이 어떤 순서로 처리되는지 설명해 주세요.",
    "단축 키는 어떻게 만들고, 키가 겹치면 어떻게 처리하나요?",
    "원래 URL 과 단축 키는 어디에 어떤 형태로 저장하나요?"
  ],
  deepDiveQuestions: [
    "조회 요청이 갑자기 10배로 늘면 어디가 먼저 병목이 되고, 어떻게 대응하나요?",
    "DB 서버 한 대가 내려가면 리다이렉트는 어떻게 되나요?",
    "같은 긴 URL 을 여러 번 단축하면 같은 키를 돌려줘야 할까요? 이유와 함께 설명해 주세요."
  ],
  difficultyComment:
    "기본 난이도에서는 읽기 경로에 캐시를 두는 이유와 단축 키 생성 방식을 설명하면 충분해요."
};

const CHAT_SERVICE: SystemDesignProblem = {
  topic: {
    title: "1:1 실시간 채팅 서비스를 설계해 보세요",
    description:
      "두 사용자가 메시지를 주고받고, 접속하지 않은 동안 받은 메시지는 나중에 볼 수 있는 서비스입니다."
  },
  hiddenRequirements: [
    {
      keywords: ["사용자", "동시", "접속", "DAU", "트래픽"],
      name: "동시 접속 규모",
      answer: "하루 활성 사용자 500만 명, 동시 접속은 최대 50만 명이라고 가정해 주세요."
    },
    {
      keywords: ["순서", "정렬"],
      name: "메시지 순서 보장",
      answer: "한 대화방 안에서는 보낸 순서대로 보여야 해요."
    },
    {
      keywords: ["보관", "기록", "히스토리", "기간"],
      name: "메시지 보관 기간",
      answer: "메시지는 1년 보관해요."
    },
    {
      keywords: ["읽음", "확인"],
      name: "읽음 표시",
      answer: "상대가 읽었는지 표시해야 해요."
    },
    {
      keywords: ["그룹", "단체"],
      name: "그룹 채팅 범위",
      answer: "그룹 채팅은 이번 범위에서 빼도 돼요."
    }
  ],
  evaluationPoints: [
    { description: "실시간 전달에 WebSocket 같은 지속 연결을 썼다", keywords: ["WebSocket", "websocket", "웹소켓", "지속 연결"] },
    { description: "접속하지 않은 사용자에게 보낼 메시지를 저장하고 다시 보냈다", keywords: ["Queue", "큐", "푸시", "오프라인"] },
    { description: "대화방 단위로 메시지 순서를 보장하는 방법을 설명했다", keywords: ["순서", "시퀀스", "sequence", "파티션"] },
    { description: "연결 서버를 늘릴 때 사용자가 어느 서버에 붙었는지 찾는 방법을 설명했다", keywords: ["세션", "Redis", "라우팅", "디스커버리"] }
  ],
  starterDiagram: {
    blocks: [
      { id: "client", kind: "CLIENT", label: "Client", props: [], position: { x: 0, y: 80 } },
      { id: "chat", kind: "API_SERVER", label: "Chat Server", props: [], position: { x: 260, y: 80 } }
    ],
    connections: [{ id: "c1", source: "client", target: "chat" }]
  },
  highLevelQuestions: [
    "확인한 요구사항을 바탕으로 메시지가 보내는 사람에서 받는 사람까지 가는 경로를 그려 주세요.",
    "받는 사람이 접속하지 않았을 때 메시지는 어떻게 처리하나요?",
    "메시지는 어떤 저장소에 어떤 키로 저장하나요?"
  ],
  deepDiveQuestions: [
    "채팅 서버를 10대로 늘리면 두 사용자가 다른 서버에 붙었을 때 어떻게 메시지를 전달하나요?",
    "같은 대화방 메시지의 순서가 뒤바뀌지 않게 하려면 어떻게 하나요?",
    "채팅 서버 한 대가 갑자기 내려가면 연결된 사용자는 어떻게 되나요?"
  ],
  difficultyComment:
    "기본 난이도에서는 서버가 여러 대일 때의 메시지 라우팅과 순서 보장을 함께 설명하면 좋아요."
};

const NEWS_FEED: SystemDesignProblem = {
  topic: {
    title: "SNS 뉴스피드를 설계해 보세요",
    description:
      "사용자가 글을 올리면 팔로워의 피드에 보이고, 사용자는 피드를 최신순으로 스크롤합니다."
  },
  hiddenRequirements: [
    {
      keywords: ["사용자", "DAU", "트래픽", "규모"],
      name: "사용자 규모",
      answer: "하루 활성 사용자 1억 명, 한 사람이 하루 평균 피드를 10번 연다고 가정해 주세요."
    },
    {
      keywords: ["팔로워", "팔로우", "친구"],
      name: "팔로워 분포",
      answer: "보통은 팔로워가 수백 명이지만, 팔로워가 수천만 명인 계정도 있어요."
    },
    {
      keywords: ["정렬", "순서", "최신", "랭킹"],
      name: "피드 정렬 기준",
      answer: "이번에는 최신순 정렬만 다뤄요."
    },
    {
      keywords: ["지연", "응답", "속도", "반영"],
      name: "피드 반영 지연",
      answer: "새 글은 5초 안에 팔로워 피드에 보이면 돼요."
    },
    {
      keywords: ["미디어", "이미지", "사진", "영상"],
      name: "미디어 처리",
      answer: "이미지는 올릴 수 있지만 영상은 이번 범위에서 빼도 돼요."
    }
  ],
  evaluationPoints: [
    { description: "쓰기 시점 전파(fan-out on write)와 읽기 시점 조회의 장단점을 비교했다", keywords: ["fan-out", "팬아웃", "전파", "push", "pull"] },
    { description: "팔로워가 아주 많은 계정은 다르게 처리했다", keywords: ["셀럽", "유명", "핫", "하이브리드", "hybrid"] },
    { description: "피드 캐시와 저장소를 나누고 크기를 추정했다", keywords: ["캐시", "Cache", "Redis", "용량"] },
    { description: "전파 작업을 비동기로 처리하고 장애 시 재처리 방법을 설명했다", keywords: ["Queue", "큐", "비동기", "재시도", "Kafka"] }
  ],
  starterDiagram: { blocks: [], connections: [] },
  highLevelQuestions: [
    "확인한 요구사항을 바탕으로 글 올리기와 피드 보기 두 흐름을 그려 주세요.",
    "새 글을 팔로워 피드에 넣는 시점을 쓰기 때와 읽기 때 중 언제로 정했나요? 이유도 설명해 주세요.",
    "피드는 어디에 어떤 형태로 저장하나요?"
  ],
  deepDiveQuestions: [
    "팔로워가 수천만 명인 계정이 글을 올리면 어떤 문제가 생기고, 어떻게 처리하나요?",
    "전파 작업을 처리하는 서버가 중간에 죽으면 일부 팔로워에게 글이 안 보일 수 있나요?",
    "피드 캐시가 통째로 날아가면 어떻게 복구하나요?"
  ],
  difficultyComment:
    "기본 난이도에서는 팔로워가 많은 계정의 글을 어떻게 전파할지 설명하면 충분해요."
};

/** 난이도는 BASIC 하나뿐이라 모든 문제가 BASIC 이다 */
export const SYSTEM_DESIGN_PROBLEMS: readonly SystemDesignProblem[] = [
  URL_SHORTENER,
  CHAT_SERVICE,
  NEWS_FEED
];

/** 숨은 요구사항에 없는 질문에 대한 답 (기획서 규칙) */
export const UNKNOWN_REQUIREMENT_ANSWER: string =
  "그 부분은 정해 두지 않았어요. 합리적으로 가정하고 진행하세요.";
