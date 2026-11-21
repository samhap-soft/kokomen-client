# 도메인별 가이드

## interview (면접 진행)

가장 복잡한 핵심 도메인. 실시간 면접 세션을 관리한다.

### 주요 파일

| 파일 | 역할 |
|------|------|
| `api/index.ts` | 면접 생성/조회 (v1 API) |
| `api/interviewAnswer.ts` | 답변 제출 + 폴링 (v2 API, interceptor 기반 retry/polling) |
| `api/questions.ts` | 질문 조회 + 커스텀 면접 생성 (v3 API) |
| `hooks/useFacialExpressionAnalysis.ts` | face-api.js 기반 표정 분석 |
| `hooks/useSpeechRecognitionWithEvents.ts` | Web Speech API 음성 인식 |
| `hooks/useInterviewStatus.ts` | 면접 상태 관리 |
| `hooks/useInterviewSettings.ts` | 면접 옵션(답변 시간 제한 / 답변 수정 금지) 상태 + localStorage 저장 |
| `hooks/useAppendOnlyAnswerInput.ts` | 답변 수정 금지(append-only) 입력 상태 |
| `hooks/useSubmitInterviewAnswer.ts` | 답변 제출 mutation |
| `utils/interviewEventEmitter.ts` | 면접 내 이벤트 통신 |
| `hooks/useCameraStream.ts` | 내 카메라 스트림(입장 화면과 면접실이 공유). 영상은 전송하지 않음 |
| `hooks/useAnswerDraft.ts` | 작성 중 답변 초안 저장(localStorage `kokomen:interview-draft:{interviewId}`) |
| `components/room/basicInterviewRoom.tsx` | 기본 면접실(텍스트 · 음성 · 라이브 코딩) |
| `components/room/useRoomMedia.tsx` | 카메라 · 표정 분석 상태와 조작 바 공통 버튼 |
| `components/room/roomTiles.tsx` | AI 면접관(3D) 타일 · 내 카메라 타일 |
| `components/room/interviewLobbyScreen.tsx` | 입장 전 화면(카메라 미리보기 + "면접 입장하기") |
| `components/interviewAnswerForm.tsx` | 답변 입력 상태 훅(`useInterviewAnswer`)과 입력창 · 제출 버튼 · 안내 |
| `components/liveCodingWorkspace.tsx` | 라이브 코딩 작업 영역과 상태 훅 |
| `components/interviewTimer.tsx` | 답변 제한 시간 카운트다운 |
| `components/interviewSettingsModal.tsx` | 면접 설정 dialog(옵션 on/off) |
| `components/interviewExitModal.tsx` | 면접 중도 종료 확인 dialog |
| `constants.ts` | 답변 제한 시간(`ANSWER_TIME_LIMIT_SECONDS`) |

### 면접실 구조

Figma `인터뷰 / to-be`(1172:2426 텍스트 · 1172:2473 음성 · 1172:2527 답변 기록) 기준.
레이아웃은 `@kokomen/ui/domains` 의 `InterviewRoomLayout` 이 맡는다(헤더 · 영상 타일 · 작업 영역 · 조작 바).

- 라우트는 하나(`/interviews/[interviewId]`)이고 `type` 쿼리로 나눈다: 없음(기본) · `CODE`(라이브 코딩) · `SYSTEM_DESIGN`.
- 배치(`variant`): 텍스트 `split`, 음성 `focus`, 라이브 코딩 · 시스템 설계 `stage`(작업 영역을 넓게, 영상은 작은 타일).
- 입장: 노크 · 문 열림 연출 대신 입장 화면을 거친다. 이미 끝난 면접은 입장 화면 없이 종료 dialog 를 띄운다.
- 조작 바: 설정 · (음성)녹음 · 카메라 아이콘 버튼은 항상 보이고, 글자 버튼(표정 분석 · 음성으로 말하기 · 면접 중도 종료)은 lg 미만에서 "더보기" 메뉴로 묶인다.
- 헤더의 "OO 모의면접" 제목은 `category` 쿼리(분야 키)로 서버에서 찾는다. 없으면 "모의면접".
- 초안은 면접마다 하나만 두고 지금 답하는 질문(progressKey)이 같을 때만 되살린다. 제출하거나 면접이 끝나면 지운다.
- 면접관은 실사 영상 클립(`public/interviewer/{id}/`)이다. 영상을 불러오지 못하면 같은 면접관의 정지 사진, 사진도 없으면 안내 문구를 보여 주고 면접은 계속된다.
- 화면 세로가 짧아도 영상 타일과 작업 영역이 패널 밖으로 넘치지 않는다. xl 의 영상 열은 size 컨테이너로 높이에 맞춰 타일을 줄이고, 작업 영역은 모자라면 패널 안에서 스크롤한다.

### 면접 모드

`InterviewMode` 타입으로 구분 (일반/게스트/커스텀 등)

### 답변 제출 흐름

1. `submitInterviewAnswerV2` POST → v2 API (10초 timeout, 3회 재시도)
2. `getInterviewAnswerV2` GET polling → `proceed_state`가 `COMPLETED`될 때까지 1초 간격 최대 30회
3. `LLM_FAILED` / `TTS_FAILED`이면 에러 처리

### 면접 설정 (답변 시간 제한 / 답변 수정 금지)

두 옵션은 기본값이 꺼짐이고, 면접 중에도 조작 바의 설정 버튼으로 켜고 끌 수 있다.
상태는 `BasicInterviewRoom` 의 `useInterviewSettings`가 갖고
`useInterviewAnswer`에 넘긴다. 변경한 값은 localStorage(`interview-settings`)에 저장된다.

- 답변 시간 제한: 켜져 있을 때만 `InterviewTimer`를 렌더한다. 옵션을 켜면 컴포넌트가 새로
  마운트되므로 제한 시간이 그 순간부터 시작된다(질문이 바뀔 때는 `key={cur_question_id}`로 리셋).
- 답변 수정 금지: `useAppendOnlyAnswerInput`의 `enabled`로 제어한다. 꺼져 있으면 일반 textarea처럼
  동작하고, 켜는 순간까지 입력한 내용이 확정(잠금)된다.

### 수정 시 주의사항

- `interviewAnswer.ts`의 interceptor는 요청별 retry 상태를 Map으로 관리함 — 전역 상태가 아님
- 폴링 로직은 interceptor 내부에서 재귀적으로 동작하므로, 무한루프 방지를 위해 maxRetries 확인 필수
- `interviewEventEmitter`는 컴포넌트 간 결합을 낮추기 위한 pub/sub 패턴

---

## systemDesign (시스템 설계 면접)

요구사항(역질문 최대 5개) → 개략 설계(질문 최대 3개) → 심화(질문 최대 3개). TEXT 전용.
**백엔드 작업 전**이라 API 는 초안이고, 개발 환경에서는 MSW 목이 응답한다.

| 파일 | 역할 |
|------|------|
| `api/index.ts` | API 초안(`/interviews/system-design/...`). 타입은 `@kokomen/types` 의 `interviews/systemDesign.ts` |
| `hooks/useSystemDesignInterview.ts` | 조회 + 역질문 · 요구사항 완료 · 답변 제출 mutation |
| `components/systemDesignRoom.tsx` | 면접실(stage 배치). 페이지에서 dynamic import 해서 React Flow 를 기본 면접에 싣지 않는다 |
| `components/systemDesignReport.tsx` | 리포트(`/interviews/[id]/system-design-report`) |
| `constants.ts` | 최대 질문 수 · 노출 여부(`IS_SYSTEM_DESIGN_AVAILABLE`) |

- 다이어그램 에디터는 `@kokomen/ui/systemDesign` 의 `DiagramEditor`(React Flow). 저장 형식은 블록(`id · kind · label · props · position`)과 연결(`source → target · label`)만 담는다.
- LLM 에 보낼 텍스트 변환은 서버에서만 한다(클라이언트는 JSON 만 보낸다). 입력 상한은 `DIAGRAM_LIMITS` 와 같게 서버도 검증해야 한다.
- 목: `src/mocks/handlers/systemDesign.ts`(상태는 sessionStorage 에도 저장), 문제 데이터 `src/mocks/fixtures/systemDesign.ts`.

---

## resume (이력서)

이력서 업로드, 평가, 이력서 기반 면접 기능을 담당.

### 주요 파일

| 파일 | 역할 |
|------|------|
| `api/index.ts` | 이력서 평가 API |
| `api/archive.ts` | 이력서 아카이브 CRUD |
| `api/resumeBasedInterview.ts` | 이력서 기반 면접 생성 |
| `context/resumeStore.tsx` | 이력서 전역 상태 (Context) |
| `context/resumeBasedInterviewStore.tsx` | 이력서 면접 전역 상태 |
| `components/pdfViewer.tsx` | react-pdf 기반 PDF 렌더링 |
| `components/resumeEvaluationForm.tsx` | 평가 요청 폼 |

### 수정 시 주의사항

- `resumeStore`와 `resumeBasedInterviewStore`는 `_app.tsx`에서 전역 제공됨
- PDF 관련 기능은 webpack에서 `canvas: false` 설정 필요 (next.config.ts)
- 데모 모드(`resumeEvaluationForm.demo.tsx`)가 별도로 존재

---

## purchase (결제)

토스페이먼츠 SDK 연동.

### 주요 파일

| 파일 | 역할 |
|------|------|
| `api/index.ts` | 결제 확인/내역 API |
| `components/PurchaseSection.tsx` | 결제 UI |
| `components/purchaseSuccessModal.tsx` | 결제 성공 모달 |
| `components/refund.tsx` | 환불 처리 |

### 결제 흐름

1. `/purchase` → 토스페이먼츠 SDK 위젯 렌더
2. 결제 완료 → `/purchase/confirm`으로 리다이렉트 (서버에서 결제 승인)
3. 실패 → `/purchase/error`

---

## recruit (채용 공고)

외부 채용 공고를 필터링하여 보여주는 기능.

### 주요 파일

- `hooks/useInfiniteRecruitList.ts` — 무한 스크롤 목록
- `components/recruitFilterContext.tsx` — 필터 상태 (Context)
- `components/recruitFilter.tsx` — 필터 UI
- `components/recruitList.tsx` — 목록 렌더링

---

## admin (관리자)

`/admin` 경로. 루트 질문 CRUD, 결제 내역 관리.

### 수정 시 주의사항

- middleware에서 JSESSIONID 기반 인증만 체크 — admin 권한 검증은 아직 TODO
- 레이아웃은 `adminLayout.tsx` + `adminSidebar.tsx`로 별도 구성

---

## dashboard (대시보드)

로그인 후 마이페이지(`/dashboard`). 면접 기록, 이력서 평가 기록, 아카이브, 닉네임 변경, 회원 탈퇴, 스트릭.

- 섹션은 `?tab=` 쿼리로 고른다(`interviews` | `resume-analyses` | `archive` | `nickname` | `withdrawal`). 잘못된 값이면 `interviews`. 파싱은 `components/selectSection.tsx` 의 `parseDashboardTab`.
- 목록 페이지 번호는 `?page=`(0부터)로 두고 `utils/pageQuery.ts` 의 `getRouterPage` · `setRouterPage` 로 읽고 쓴다. 다른 쿼리(tab)는 유지된다.
- 면접 기록 API(`/interviews/me`)는 전체 개수를 주지 않아 `size + 1` 개를 받아 다음 페이지 여부만 판단한다.

---

## members (멤버)

공개 멤버 프로필. 랭킹 카드, 면접 기록 열람.

---

## interviewReport (면접 리포트)

면접 완료 후 결과 페이지. 답변별 피드백, 메모 기능.

---

## notifications (알림)

알림 패널 컴포넌트. 별도 알림 API(`NEXT_PUBLIC_NOTIFICATION_API_BASE_URL`) 사용.
