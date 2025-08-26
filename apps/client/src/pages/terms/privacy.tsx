import { getUserInfo } from "@/domains/auth/api";
import Header from "@/shared/header";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { JSX } from "react";

export default function PrivacyPage({
  user
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  return (
    <>
      <Header user={user} />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">개인정보 처리 방침</h1>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold mb-4">
              1. 개인정보의 처리 목적
            </h2>
            <p className="leading-relaxed">
              꼬꼬면(이하 &ldquo;회사&rdquo;)은 다음의 목적을 위하여 개인정보를
              처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는
              이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보보호법
              제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할
              예정입니다.
            </p>
            <div className="mt-4 space-y-2">
              <p>• 서비스 제공 및 계정 관리</p>
              <p>• 면접 연습 서비스 이용</p>
              <p>• 고객 상담 및 문의 응대</p>
              <p>• 서비스 개선 및 신규 서비스 개발</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">
              2. 개인정보의 처리 및 보유기간
            </h2>
            <div className="space-y-4">
              <p className="leading-relaxed">
                회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터
                개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서
                개인정보를 처리·보유합니다.
              </p>
              <div className="space-y-2">
                <p>• 서비스 이용기간: 회원 탈퇴 시까지</p>
                <p>• 면접 기록: 서비스 제공 목적 달성 시까지</p>
                <p>• 로그 기록: 3개월</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">
              3. 수집하는 개인정보 항목
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">
                  카카오 소셜 로그인을 통한 수집 정보:
                </h3>
                <div className="space-y-1 ml-4">
                  <p>• 이메일 주소</p>
                  <p>• 이름</p>
                  <p>• 카카오 계정 ID</p>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">
                  서비스 이용 중 생성되는 정보:
                </h3>
                <div className="space-y-1 ml-4">
                  <p>• 닉네임 (서비스 내 설정)</p>
                  <p>• 면접 기록 및 피드백</p>
                  <p>• 서비스 이용 로그</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">
              4. 개인정보의 제3자 제공
            </h2>
            <p className="leading-relaxed">
              회사는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서
              명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정
              등 개인정보보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를
              제3자에게 제공합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">
              5. 개인정보의 파기절차 및 방법
            </h2>
            <div className="space-y-4">
              <p className="leading-relaxed">
                회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가
                불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.
              </p>
              <div className="space-y-2">
                <p>
                  • 전자적 파일 형태의 정보: 복구 및 재생이 불가능한 방법으로
                  영구 삭제
                </p>
                <p>
                  • 종이에 출력된 개인정보: 분쇄기로 분쇄하거나 소각을 통한 파기
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">
              6. 정보주체의 권리·의무 및 행사방법
            </h2>
            <div className="space-y-2">
              <p>
                정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련
                권리를 행사할 수 있습니다.
              </p>
              <div className="ml-4 space-y-1">
                <p>• 개인정보 열람요구</p>
                <p>• 오류 등이 있을 경우 정정 요구</p>
                <p>• 삭제요구</p>
                <p>• 처리정지 요구</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">
              7. 개인정보의 안전성 확보 조치
            </h2>
            <div className="space-y-2">
              <p>
                회사는 개인정보보호법 제29조에 따라 다음과 같은 안전성 확보
                조치를 취하고 있습니다.
              </p>
              <div className="ml-4 space-y-1">
                <p>• 개인정보의 암호화</p>
                <p>• 해킹 등에 대비한 기술적 대책</p>
                <p>• 개인정보에 대한 접근 제한</p>
                <p>• 개인정보 취급 직원의 최소화 및 교육</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">
              8. 면접 기록의 공개에 관한 안내
            </h2>
            <div className="space-y-4">
              <p className="leading-relaxed">
                본 서비스는 면접 연습을 통한 학습 효과 증진을 위해 모든 면접
                기록을 공개적으로 제공합니다.
              </p>
              <div className="space-y-2">
                <p>
                  • 모든 면접 기록은 개인을 식별할 수 없는 형태로 공개됩니다.
                </p>
                <p>
                  • 면접 기록에는 개인정보(이름, 이메일 등)가 포함되지 않습니다.
                </p>
                <p>
                  • 서비스 이용 시 면접 기록의 공개에 동의한 것으로 간주됩니다.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">
              9. 개인정보 보호책임자
            </h2>
            <div className="space-y-2">
              <p>
                회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보
                처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와
                같이 개인정보 보호책임자를 지정하고 있습니다.
              </p>
              <div className="ml-4 space-y-1">
                <p>▶ 개인정보 보호책임자</p>
                <p>• 성명: 조민형</p>
                <p>• 직책: CEO</p>
                <p>• 연락처: samhapsoft@gmail.com</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">
              10. 개인정보 처리방침 변경
            </h2>
            <p className="leading-relaxed">
              이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른
              변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일
              전부터 공지사항을 통하여 고지할 것입니다.
            </p>
          </section>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              본 방침은 2025년 8월 1일부터 시행됩니다.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const { data } = await getUserInfo(context);
    return {
      props: {
        user: data
      }
    };
  } catch (error) {
    return {
      props: {
        user: null
      }
    };
  }
};
