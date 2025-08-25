import { createFileRoute } from "@tanstack/react-router";
import { JSX } from "react";

export const Route = createFileRoute("/terms/termsofuse")({
  component: TermsOfUsePage
});

function TermsOfUsePage(): JSX.Element {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">서비스 이용 약관</h1>

      <div className="space-y-6 text-gray-700">
        <section>
          <h2 className="text-xl font-semibold mb-4">제1조 (목적)</h2>
          <p className="leading-relaxed">
            본 약관은 꼬꼬면(이하 &quot;회사&quot;)이 제공하는 면접 연습
            서비스(이하 &quot;서비스&quot;)의 이용과 관련하여 회사와 이용자
            간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">제2조 (정의)</h2>
          <div className="space-y-2">
            <p>
              1. &quot;서비스&quot;란 회사가 제공하는 AI 기반 면접 연습 및
              피드백 서비스를 의미합니다.
            </p>
            <p>
              2. &quot;이용자&quot;란 본 약관에 따라 회사와 이용계약을
              체결하고 서비스를 이용하는 자를 의미합니다.
            </p>
            <p>
              3. &quot;면접 기록&quot;이란 이용자가 서비스 내에서 진행한 면접
              연습의 내용 및 결과를 의미합니다.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">제3조 (서비스 이용)</h2>
          <div className="space-y-2">
            <p>
              1. 이용자는 카카오 계정을 통한 소셜 로그인으로 서비스를 이용할
              수 있습니다.
            </p>
            <p>
              2. 이용자는 서비스 내에서 닉네임을 설정하여 활동할 수 있습니다.
            </p>
            <p>3. 이용자는 본인의 면접 기록을 생성하고 관리할 수 있습니다.</p>
            <p>
              4. 모든 면접 기록은 공개적으로 다른 이용자들이 열람할 수
              있습니다.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            제4조 (이용자의 의무)
          </h2>
          <div className="space-y-2">
            <p>1. 이용자는 관련 법령 및 본 약관을 준수해야 합니다.</p>
            <p>
              2. 이용자는 타인의 권리나 명예, 신용 등을 침해하는 행위를 해서는
              안 됩니다.
            </p>
            <p>
              3. 이용자는 서비스의 정상적인 운영을 방해하는 행위를 해서는 안
              됩니다.
            </p>
            <p>
              4. 이용자는 면접 기록에 개인정보나 타인의 정보를 포함하지 않도록
              주의해야 합니다.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            제5조 (서비스 제공의 중단)
          </h2>
          <p className="leading-relaxed">
            회사는 시스템 점검, 보수, 교체 등의 사유로 서비스 제공을
            일시적으로 중단할 수 있으며, 이 경우 사전에 공지합니다. 단, 긴급한
            경우 사후 공지할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            제6조 (면접 기록의 공개)
          </h2>
          <div className="space-y-2">
            <p>
              1. 이용자가 생성한 모든 면접 기록은 서비스 내에서 공개됩니다.
            </p>
            <p>
              2. 면접 기록에는 개인을 식별할 수 있는 정보가 포함되지 않습니다.
            </p>
            <p>3. 이용자는 면접 기록의 공개에 동의한 것으로 간주됩니다.</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">제7조 (책임의 제한)</h2>
          <p className="leading-relaxed">
            회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중단 등
            불가항력적인 사유로 서비스를 제공할 수 없는 경우 책임을 지지
            않습니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">제8조 (약관의 변경)</h2>
          <p className="leading-relaxed">
            회사는 필요한 경우 본 약관을 변경할 수 있으며, 변경된 약관은
            서비스 내 공지사항을 통해 공지합니다. 변경된 약관은 공지일로부터
            7일 후 효력이 발생합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            제9조 (준거법 및 관할법원)
          </h2>
          <p className="leading-relaxed">
            본 약관은 대한민국 법률에 따라 해석되며, 서비스 이용으로 발생한
            분쟁에 대해서는 회사의 주소지 관할법원을 관할법원으로 합니다.
          </p>
        </section>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            본 약관은 2025년 8월 1일부터 시행됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
