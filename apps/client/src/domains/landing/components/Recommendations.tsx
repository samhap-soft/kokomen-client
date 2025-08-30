import React from "react";

const recommendations: Array<{
  name: string;
  job: string;
  recommendation: string;
}> = [
  {
    name: "유호균",
    job: "現 SW 마에스트로 멘토 · 前 NAVER 검색 모니터링팀 리더",
    recommendation:
      "면접은 '구조화된 말하기·근거·오답노트'의 싸움입니다.\n 꼬꼬면은 모의면접·오답노트·랭커 답변 벤치마킹을 한 화면에 모아, 초심자도 실전 답변의 논리적 뼈대를 빠르게 체화하게 합니다."
  },
  //TODO: 복다훈 멘토님 수정
  {
    name: "복다훈",
    job: "우아한형제들 프론트엔드 개발자",
    recommendation:
      "실제 기술면접 질문들이 확실히 제가 면접관으로 재직하면서 면접자분들께 드렸던 질문과 비슷한 부분이 있었습니다. 꼬꼬면은 기술 면접 질문들을 한 곳에 모아두어 학습에 도움이 "
  },
  {
    name: "신기용",
    job: "現 카카오뱅크 서버 개발자 · 現 SW 마에스트로 멘토 · 前 LINE 서버 개발자",
    recommendation:
      "직접 사용해보니 실제 면접에서 받을 만한 좋은 질문들이 많은 것 같네요.\n CS 학습에도 자연스럽게 도움이 되어 취준생이나 이직 준비생들에게 큰 힘이 될 것 같습니다. 연수생들이 직접 만든 서비스인데도 디자인까지 잘 뽑혀 있어 인상적이었습니다."
  }
];

function Recommendations(): React.ReactElement {
  return (
    <section className="w-full py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {recommendations.map((recommendation) => (
          <div
            key={recommendation.name}
            className="group relative bg-bg-elevated rounded-2xl border border-border-secondary hover:border-border transition-all duration-300 overflow-hidden hover:shadow-xl"
          >
            <div className="relative flex flex-col h-full">
              <div className="border-b border-border-secondary p-4">
                <div className="flex-1">
                  <h3 className="font-bold text-text-primary text-lg mb-1">
                    {recommendation.name}
                  </h3>
                  <p className="text-sm text-text-tertiary leading-tight">
                    {recommendation.job}
                  </p>
                </div>
              </div>
              <p className="text-text-secondary leading-relaxed flex-grow whitespace-pre-line p-4">
                {recommendation.recommendation}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Recommendations;
