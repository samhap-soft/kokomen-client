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
    job: "現 우아한형제들 프론트엔드 개발자",
    recommendation:
      "'꼬꼬면'은 게임처럼 즐기며 면접 실력을 키울 수 있는 실용적인 서비스입니다. 읽거나 시청하는 학습보다 직접 참여해 문제를 풀어보는 방식이 더 효과적인 만큼, 랭커들의 실제 답변과 비교하고 개인 맞춤형 피드백을 받아볼 수 있는 경험은 큰 도움이 될 것입니다. 면접 준비의 부담을 덜고 실전 감각을 기르는 데 든든한 조력자가 되어줄 것 같습니다."
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
      <div className="flex flex-wrap gap-8 w-full justify-center">
        {recommendations.map((recommendation) => (
          <div
            key={recommendation.name}
            className="group relative bg-bg-elevated rounded-2xl border border-border-secondary hover:border-border transition-all duration-300 overflow-hidden hover:shadow-xl max-w-[350px]"
          >
            <div className="relative flex flex-col">
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
              <p className="text-text-secondary leading-relaxed whitespace-pre-line p-4">
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
