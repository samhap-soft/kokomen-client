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
| `components/liveCodingOverlay.tsx` | 라이브 코딩 오버레이 |
| `components/interviewAnswerForm.tsx` | 답변 입력 UI |
| `components/cameraPreview.tsx` | 카메라 프리뷰 |
| `components/interviewTimer.tsx` | 답변 제한 시간 카운트다운 |
| `components/interviewSettingsButton.tsx` | 면접 설정 dialog(옵션 on/off) |
| `constants.ts` | 답변 제한 시간(`ANSWER_TIME_LIMIT_SECONDS`) |

### 면접 모드

`InterviewMode` 타입으로 구분 (일반/게스트/커스텀 등)

### 답변 제출 흐름

1. `submitInterviewAnswerV2` POST → v2 API (10초 timeout, 3회 재시도)
2. `getInterviewAnswerV2` GET polling → `proceed_state`가 `COMPLETED`될 때까지 1초 간격 최대 30회
3. `LLM_FAILED` / `TTS_FAILED`이면 에러 처리

### 면접 설정 (답변 시간 제한 / 답변 수정 금지)

두 옵션은 기본값이 꺼짐이고, 면접 중에도 좌측 상단 설정 버튼으로 켜고 끌 수 있다.
상태는 페이지(`pages/interviews/[interviewId]/index.tsx`)의 `useInterviewSettings`가 갖고
`InterviewAnswerForm`에 prop으로 내려준다. 변경한 값은 localStorage(`interview-settings`)에 저장된다.

- 답변 시간 제한: 켜져 있을 때만 `InterviewTimer`를 렌더한다. 옵션을 켜면 컴포넌트가 새로
  마운트되므로 제한 시간이 그 순간부터 시작된다(질문이 바뀔 때는 `key={cur_question_id}`로 리셋).
- 답변 수정 금지: `useAppendOnlyAnswerInput`의 `enabled`로 제어한다. 꺼져 있으면 일반 textarea처럼
  동작하고, 켜는 순간까지 입력한 내용이 확정(잠금)된다.

### 수정 시 주의사항

- `interviewAnswer.ts`의 interceptor는 요청별 retry 상태를 Map으로 관리함 — 전역 상태가 아님
- 폴링 로직은 interceptor 내부에서 재귀적으로 동작하므로, 무한루프 방지를 위해 maxRetries 확인 필수
- `interviewEventEmitter`는 컴포넌트 간 결합을 낮추기 위한 pub/sub 패턴

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

로그인 후 메인 페이지. 닉네임 변경, 면접 기록, 스트릭, 회원 탈퇴.

---

## members (멤버)

공개 멤버 프로필. 랭킹 카드, 면접 기록 열람.

---

## interviewReport (면접 리포트)

면접 완료 후 결과 페이지. 답변별 피드백, 메모 기능.

---

## notifications (알림)

알림 패널 컴포넌트. 별도 알림 API(`NEXT_PUBLIC_NOTIFICATION_API_BASE_URL`) 사용.
