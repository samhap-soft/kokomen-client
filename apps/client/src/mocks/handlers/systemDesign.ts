import type {
  AnswerScore,
  RequirementQuestion,
  SystemDesignAnswer,
  SystemDesignDiagram,
  SystemDesignInterview,
  SystemDesignReport,
  SystemDesignStage
} from "@kokomen/types";
import { delay, http, HttpResponse } from "msw";
import {
  SYSTEM_DESIGN_PROBLEMS,
  UNKNOWN_REQUIREMENT_ANSWER
} from "@/mocks/fixtures/systemDesign";

/**
 * 시스템 설계 면접 MSW 목 (API 초안).
 *
 * 브라우저에서는 NEXT_PUBLIC_API_MOCKING=enabled 일 때만 켜진다(src/mocks/browser.ts).
 * jest 에서는 server.use(...systemDesignHandlers) 로 같은 핸들러를 쓴다.
 * 새로고침해도 이어서 볼 수 있도록 상태를 sessionStorage 에 함께 둔다.
 */

const MAX_REQUIREMENT_QUESTIONS = 5;
const QUESTIONS_PER_STAGE = 3;
const MAX_QUESTION_COUNT = QUESTIONS_PER_STAGE * 2;
const MAX_QUESTION_LENGTH = 200;
const MAX_ANSWER_LENGTH = 3000;
const MAX_BLOCKS = 30;
const MAX_CONNECTIONS = 60;
const STORAGE_KEY = "kokomen:mock:system-design";
/** 실제 면접 id 와 겹치지 않도록 큰 수에서 시작한다 */
const MOCK_ID_START = 900001;

type MockState = SystemDesignInterview & {
  problem_index: number;
  stage_question_index: number;
  asked_requirement_names: string[];
  ranks: AnswerScore[];
};

const store = new Map<number, MockState>();

/** 화면에서 로딩 상태가 보이도록 응답을 조금 늦춘다. jest 에서는 기다리지 않는다 */
const respondAfter = (ms: number): Promise<void> =>
  delay(process.env.NODE_ENV === "test" ? 0 : ms);

const persist = (): void => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...store.entries()]));
  } catch {
    // jest 등 sessionStorage 가 없으면 메모리에만 둔다
  }
};

const restore = (): void => {
  if (store.size > 0) return;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    for (const [id, state] of JSON.parse(raw) as [number, MockState][]) {
      store.set(id, state);
    }
  } catch {
    // 깨진 값이면 새로 시작한다
  }
};

export const resetSystemDesignMock = (): void => {
  store.clear();
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // 무시
  }
};

// 이전 형식으로 저장된 세션(problem_index 없음)은 첫 문제로 본다
const getProblem = (state: MockState) =>
  SYSTEM_DESIGN_PROBLEMS[state.problem_index] ?? SYSTEM_DESIGN_PROBLEMS[0];

const getStageQuestions = (
  state: MockState,
  stage: Exclude<SystemDesignStage, "REQUIREMENTS">
): string[] =>
  stage === "HIGH_LEVEL"
    ? getProblem(state).highLevelQuestions
    : getProblem(state).deepDiveQuestions;

/** 목 내부에서만 쓰는 필드는 응답에서 뺀다 */
const toPublic = (state: MockState): SystemDesignInterview => {
  /* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */
  const {
    problem_index: _problem,
    stage_question_index: _index,
    asked_requirement_names: _asked,
    ranks: _ranks,
    ...rest
  } = state;
  /* eslint-enable no-unused-vars, @typescript-eslint/no-unused-vars */
  return rest;
};

const findState = (id: string | readonly string[] | undefined): MockState | null => {
  restore();
  const numericId = Number(Array.isArray(id) ? id[0] : id);
  return store.get(numericId) ?? null;
};

const notFound = (): HttpResponse<{ message: string }> =>
  HttpResponse.json({ message: "면접을 찾을 수 없어요." }, { status: 404 });

const badRequest = (message: string): HttpResponse<{ message: string }> =>
  HttpResponse.json({ message }, { status: 400 });

const isValidDiagram = (diagram: SystemDesignDiagram | undefined): boolean =>
  Boolean(diagram) &&
  Array.isArray(diagram?.blocks) &&
  Array.isArray(diagram?.connections) &&
  (diagram?.blocks.length ?? 0) <= MAX_BLOCKS &&
  (diagram?.connections.length ?? 0) <= MAX_CONNECTIONS;

/** 목 등급: 답변 길이와 다이어그램 블록 수만 본다. 실제 평가는 서버 LLM 이 한다 */
const rankAnswer = (answer: string, diagram: SystemDesignDiagram): AnswerScore => {
  const score = Math.min(answer.length / 80, 3) + Math.min(diagram.blocks.length / 3, 2);
  if (score >= 4) return "A";
  if (score >= 3) return "B";
  if (score >= 2) return "C";
  if (score >= 1) return "D";
  return "F";
};

const findRequirementAnswer = (
  state: MockState,
  question: string
): { answer: string; name: string | null } => {
  const matched = getProblem(state).hiddenRequirements.find((requirement) =>
    requirement.keywords.some((keyword) =>
      question.toLowerCase().includes(keyword.toLowerCase())
    )
  );
  return matched
    ? { answer: matched.answer, name: matched.name }
    : { answer: UNKNOWN_REQUIREMENT_ANSWER, name: null };
};

const buildReport = (state: MockState): SystemDesignReport => {
  const problem = getProblem(state);
  const corpus = [
    ...state.prev_questions_and_answers.map((item) => item.answer),
    ...state.diagram.blocks.flatMap((block) => [
      block.label,
      ...block.props.map((prop) => `${prop.key} ${prop.value}`)
    ]),
    ...state.diagram.connections.map((connection) => connection.label ?? "")
  ]
    .join(" ")
    .toLowerCase();
  const evaluationPoints = problem.evaluationPoints.map((point) => ({
    description: point.description,
    is_met: point.keywords.some((keyword) => corpus.includes(keyword.toLowerCase()))
  }));
  const metCount = evaluationPoints.filter((point) => point.is_met).length;
  const feedbacks = state.prev_questions_and_answers.map((item, index) => {
    const rank = state.ranks[index] ?? "C";
    return {
      ...item,
      answer_rank: rank,
      answer_feedback:
        rank === "A" || rank === "B"
          ? "구조와 이유를 함께 설명해서 의도가 잘 드러나요. 숫자로 근거를 더하면 더 좋아요."
          : "결론만 있고 그렇게 정한 이유가 부족해요. 트래픽이나 데이터 크기를 근거로 들어 보세요."
    };
  });
  return {
    interview_id: state.interview_id,
    topic: state.topic,
    difficulty: state.difficulty,
    total_score: Math.round((metCount / evaluationPoints.length) * 100),
    total_feedback:
      metCount >= evaluationPoints.length / 2
        ? "핵심 구성 요소를 갖추고 요구사항과 연결해 설명했어요. 놓친 평가 포인트를 보완해 보세요."
        : "전체 흐름은 그렸지만 요구사항을 근거로 한 설명이 부족해요. 놓친 요구사항부터 다시 확인해 보세요.",
    difficulty_comment: problem.difficultyComment,
    evaluation_points: evaluationPoints,
    missed_requirements: problem.hiddenRequirements
      .filter((requirement) => !state.asked_requirement_names.includes(requirement.name))
      .map((requirement) => requirement.name),
    requirement_questions: state.requirement_questions,
    feedbacks,
    final_diagram: state.diagram
  };
};

const BASE = "*/interviews/system-design";

export const systemDesignHandlers = [
  http.post(`${BASE}`, async () => {
    restore();
    const id = Math.max(MOCK_ID_START - 1, ...store.keys()) + 1;
    // 실제 서버는 무작위로 고른다. 목은 테스트가 같은 결과를 내도록 차례로 돌린다
    const problemIndex = (id - MOCK_ID_START) % SYSTEM_DESIGN_PROBLEMS.length;
    const problem = SYSTEM_DESIGN_PROBLEMS[problemIndex];
    store.set(id, {
      problem_index: problemIndex,
      interview_id: id,
      interview_type: "SYSTEM_DESIGN",
      interview_state: "IN_PROGRESS",
      difficulty: "BASIC",
      topic: problem.topic,
      stage: "REQUIREMENTS",
      requirement_questions: [],
      max_requirement_question_count: MAX_REQUIREMENT_QUESTIONS,
      cur_question_id: null,
      cur_question: null,
      prev_questions_and_answers: [],
      cur_question_count: 0,
      max_question_count: MAX_QUESTION_COUNT,
      diagram: problem.starterDiagram,
      stage_question_index: 0,
      asked_requirement_names: [],
      ranks: []
    });
    persist();
    await respondAfter(300);
    return HttpResponse.json({ interview_id: id }, { status: 201 });
  }),

  http.get(`${BASE}/:interviewId`, async ({ params }) => {
    const state = findState(params.interviewId);
    if (!state) return notFound();
    await respondAfter(200);
    return HttpResponse.json(toPublic(state));
  }),

  http.post(`${BASE}/:interviewId/requirement-questions`, async ({ params, request }) => {
    const state = findState(params.interviewId);
    if (!state) return notFound();
    const body = (await request.json().catch(() => null)) as { question?: string } | null;
    const question = body?.question?.trim() ?? "";
    if (state.stage !== "REQUIREMENTS") return badRequest("요구사항 단계가 끝났어요.");
    if (!question || question.length > MAX_QUESTION_LENGTH) {
      return badRequest(`질문은 1~${MAX_QUESTION_LENGTH}자로 적어 주세요.`);
    }
    if (state.requirement_questions.length >= MAX_REQUIREMENT_QUESTIONS) {
      return badRequest("역질문은 5개까지 할 수 있어요.");
    }
    const { answer, name } = findRequirementAnswer(state, question);
    const item: RequirementQuestion = { question, answer };
    state.requirement_questions.push(item);
    if (name && !state.asked_requirement_names.includes(name)) {
      state.asked_requirement_names.push(name);
    }
    persist();
    await respondAfter(700);
    return HttpResponse.json({
      ...item,
      remaining_count: MAX_REQUIREMENT_QUESTIONS - state.requirement_questions.length
    });
  }),

  http.post(`${BASE}/:interviewId/requirements/complete`, async ({ params }) => {
    const state = findState(params.interviewId);
    if (!state) return notFound();
    if (state.stage !== "REQUIREMENTS") return badRequest("이미 설계 단계예요.");
    state.stage = "HIGH_LEVEL";
    state.stage_question_index = 0;
    state.cur_question_id = 1;
    state.cur_question = getStageQuestions(state, "HIGH_LEVEL")[0];
    persist();
    await respondAfter(500);
    return HttpResponse.json({
      stage: "HIGH_LEVEL",
      cur_question_id: state.cur_question_id,
      cur_question: state.cur_question
    });
  }),

  http.post(`${BASE}/:interviewId/answers`, async ({ params, request }) => {
    const state = findState(params.interviewId);
    if (!state) return notFound();
    const body = (await request.json().catch(() => null)) as {
      question_id?: number;
      answer?: string;
      diagram?: SystemDesignDiagram;
    } | null;
    if (state.interview_state === "FINISHED") return badRequest("이미 끝난 면접이에요.");
    if (state.stage === "REQUIREMENTS") return badRequest("요구사항 정리를 먼저 끝내 주세요.");
    if (body?.question_id !== state.cur_question_id) return badRequest("지금 질문이 아니에요.");
    const answer = body?.answer?.trim() ?? "";
    if (!answer || answer.length > MAX_ANSWER_LENGTH) {
      return badRequest(`답변은 1~${MAX_ANSWER_LENGTH}자로 적어 주세요.`);
    }
    if (!isValidDiagram(body?.diagram)) return badRequest("다이어그램이 너무 크거나 형식이 맞지 않아요.");
    const diagram = body!.diagram as SystemDesignDiagram;
    const stage = state.stage;
    const record: SystemDesignAnswer = {
      question_id: state.cur_question_id as number,
      stage,
      question: state.cur_question ?? "",
      answer,
      diagram
    };
    const rank = rankAnswer(answer, diagram);
    state.prev_questions_and_answers.push(record);
    state.ranks.push(rank);
    state.diagram = diagram;
    state.cur_question_count += 1;
    state.stage_question_index += 1;

    if (state.stage_question_index >= QUESTIONS_PER_STAGE) {
      if (stage === "HIGH_LEVEL") {
        state.stage = "DEEP_DIVE";
        state.stage_question_index = 0;
      } else {
        state.interview_state = "FINISHED";
        state.cur_question_id = null;
        state.cur_question = null;
      }
    }
    if (state.interview_state !== "FINISHED") {
      const nextStage = state.stage as Exclude<SystemDesignStage, "REQUIREMENTS">;
      state.cur_question_id = (state.cur_question_id ?? 0) + 1;
      state.cur_question = getStageQuestions(state, nextStage)[state.stage_question_index];
    }
    persist();
    await respondAfter(900);
    return HttpResponse.json({
      interview_state: state.interview_state,
      stage: state.stage,
      cur_answer_rank: rank,
      next_question_id: state.cur_question_id,
      next_question: state.cur_question
    });
  }),

  http.get(`${BASE}/:interviewId/report`, async ({ params }) => {
    const state = findState(params.interviewId);
    if (!state) return notFound();
    if (state.interview_state !== "FINISHED") {
      return badRequest("면접이 끝나야 리포트를 볼 수 있어요.");
    }
    await respondAfter(300);
    return HttpResponse.json(buildReport(state));
  })
];
