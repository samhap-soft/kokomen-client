import { CamelCasedProperties, ResumeOutput } from "@kokomen/types";

export const resumeEvaluationDemoResult: CamelCasedProperties<ResumeOutput> = {
  technicalSkills: {
    score: 92,
    reason: `• 최신 프레임워크 및 기술 스택에 대한 깊이 있는 이해도
• 프론트엔드(React, Next.js, TypeScript)와 백엔드(Node.js, NestJS) 전반적인 풀스택 역량
• 클라우드 인프라(AWS, Docker, Kubernetes) 및 CI/CD 파이프라인 구축 경험
• 성능 최적화 및 코드 품질 관리를 위한 체계적인 접근 방식
• 다양한 데이터베이스(PostgreSQL, MongoDB, Redis) 활용 능력`,
    improvements: `• 서비스 아키텍처 설계 및 운영 경험 쌓기
• 보안 취약점 분석 및 대응 능력 강화
• 테스트 자동화 및 TDD 방법론 심화 학습`
  },
  projectExperience: {
    score: 70,
    reason: `• 개인 프로젝트 위주로 실무 협업 경험이 부족함
• 소규모 토이 프로젝트 중심으로 대규모 시스템 경험 제한적
• 프로젝트 완성도는 있으나 운영 및 유지보수 경험 부족
• GitHub 관리는 하고 있으나 팀 협업 워크플로우 경험 없음
• 프로젝트 다양성이 부족하고 비슷한 기술 스택 반복 사용`,
    improvements: `• 실무 협업 프로젝트 또는 인턴 경험을 통한 팀워크 역량 강화
• 대규모 트래픽 처리 및 성능 최적화 실전 경험 필요
• 레거시 코드 리팩토링 및 유지보수 경험 부족
• 프로젝트 기획부터 배포까지의 비즈니스 관점 경험 필요
• 다양한 도메인의 프로젝트 경험으로 시야 확장 권장`
  },
  problemSolving: {
    score: 70,
    reason: `• 알고리즘 문제 풀이는 가능하나 실무 문제 해결 경험 부족
• 복잡한 버그에 대한 체계적인 디버깅 접근법이 미흡함
• 에러 처리가 표면적이고 근본 원인 분석 능력 부족
• 문제 해결 시 검색 의존도가 높고 독립적 해결 능력 제한적
• 성능 이슈나 시스템 장애 대응 경험이 거의 없음`,
    improvements: `• 실무에서 발생하는 복잡한 버그 디버깅 경험 필요
• 시스템 장애 대응 및 트러블슈팅 실전 경험 부족
• 성능 병목 지점 식별 및 최적화 실무 경험 필요
• 다양한 시나리오의 엣지 케이스 처리 경험 축적
• 코드 리뷰를 통한 문제 해결 접근법 다각화 필요`
  },
  careerGrowth: {
    score: 55,
    reason: `• 커리어 방향성이 불명확하고 구체적인 성장 계획 부재
• 트렌드만 쫓아가며 한 분야의 깊이 있는 전문성 부족
• 학습이 산발적이고 체계적인 성장 전략이 없음
• 피드백을 받아도 실질적인 개선으로 이어지지 않음
• 단기 목표에만 집중하고 장기적 비전이 부족함`,
    improvements: `• 멘토링 경험을 통해 얻은 경험이 부재
• 한 가지 분야의 전문성을 깊이 있게 쌓는 전략 고려
• 멘토링이나 시니어 개발자와의 정기적인 교류를 통한 성장 방향 설정
• 학습한 내용을 체계적으로 정리하고 공유하는 습관 필요
• 기술 트렌드 파악과 실무 적용 사이의 균형 필요
• 단순 코딩 스킬을 넘어 비즈니스 이해도 향상 필요`
  },
  documentation: {
    score: 35,
    reason: `• 문서화에 대한 중요성 인식이 부족하고 습관화되지 않음
• README가 매우 간략하거나 형식적으로만 작성됨
• 코드 주석이 거의 없어 코드 의도 파악이 어려움
• 기술적 결정 과정이나 이유를 전혀 기록하지 않음
• API 문서, 명세서 작성 경험이 전무함`,
    improvements: `• 모든 프로젝트에 상세한 README 작성 습관 들이기
• 기술 블로그를 통한 학습 내용 정리 및 공유 시작
`
  },
  totalScore: 60,
  totalFeedback: `기술적 역량이 매우 뛰어난 개발자입니다!

특히 최신 기술 스택에 대한 이해도와 활용 능력이 돋보이며, 풀스택 개발 역량을 갖춘 점이 강점입니다. 다만 대부분의 경험이 개인 프로젝트 중심이라 실무 협업 경험과 대규모 시스템 운영 경험이 보완되면 더욱 성장할 수 있을 것입니다.

가장 시급한 개선점은 문서화 습관입니다. 훌륭한 코드를 작성하시지만 이를 체계적으로 정리하고 공유하는 능력이 부족한 편입니다. 기술 블로그나 README 작성을 통해 문서화 역량을 키우신다면 팀 협업 시 큰 강점이 될 것입니다.

또한 커리어 성장 방향성을 보다 구체화하고, 단기 학습 중심에서 벗어나 장기적인 전문성 구축 전략을 세우시는 것을 권장합니다. 현재의 높은 기술력을 바탕으로 실무 경험과 문서화 능력만 보완된다면, 빠르게 핵심 개발자로 성장할 수 있는 잠재력을 가진 인재입니다.`
};

export const resumeEvaluationCategories: {
  key: string;
  label: string;
  color: string;
}[] = [
  { key: "technicalSkills", label: "기술 역량", color: "#1677ff" },
  { key: "projectExperience", label: "프로젝트 경험", color: "#52c41a" },
  { key: "problemSolving", label: "문제 해결", color: "#faad14" },
  { key: "careerGrowth", label: "성장 가능성", color: "#eb2f96" },
  { key: "documentation", label: "문서화 능력", color: "#722ed1" }
];

// 등급별 색상 및 범위
export const resumeEvaluationGradeColors: Record<string, string> = {
  Excellent: "#52c41a",
  Good: "#1677ff",
  Average: "#faad14",
  Poor: "#ff7875",
  "Very Poor": "#ff4d4f"
};

export const resumeEvaluationGradeRanges: {
  grade: string;
  min: number;
  max: number;
}[] = [
  { grade: "매우 부적합", min: 0, max: 20 },
  { grade: "부적합", min: 20, max: 40 },
  { grade: "보통", min: 40, max: 60 },
  { grade: "양호", min: 60, max: 80 },
  { grade: "우수", min: 80, max: 100 }
];

export const resumeEvaluationGradeLabels: Record<string, string> = {
  Excellent: "우수",
  Good: "양호",
  Average: "보통",
  Poor: "부적합",
  "Very Poor": "매우 부적합"
};
