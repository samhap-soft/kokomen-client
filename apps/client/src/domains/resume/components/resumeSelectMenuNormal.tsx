import Link from "next/link";
import Image from "next/image";
import { Tooltip } from "@kokomen/ui";
interface MenuItemProps {
  title: string;
  description: string;
  color: "blue" | "green";
  link: string;
  disabled: boolean;
}

const MenuItem = ({
  title,
  description,
  color,
  link,
  disabled
}: MenuItemProps) => {
  const colorClasses = {
    blue: {
      bg: "bg-blue-1 hover:bg-blue-2",
      border: "border-blue-3 hover:border-blue-5 active:border-blue-7"
    },
    green: {
      bg: "bg-green-1 hover:bg-green-2",
      border: "border-green-3 hover:border-green-5"
    }
  };
  const colors = colorClasses[color];

  return (
    <Link
      href={link}
      className={`
         rounded-lg border-2 p-6 cursor-pointer
        ${colors.bg} ${colors.border}
        transition-all duration-300 ease-in-out
        hover:shadow-lg hover:scale-105
        text-left w-full justify-start
        ${disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}
      `}
      aria-disabled={disabled}
    >
      <div className="flex flex-col justify-start align-start items-start space-y-4 w-full">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-text-heading">{title}</h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
};

// const SwitchViewButton = () => {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const handleClick = () => {
//     const params = new URLSearchParams(searchParams);
//     params.set("view", "3d");
//     router.replace(`/resume?${params.toString()}`);
//   };
//   return (
//     <Button
//       variant="outline"
//       className="absolute top-4 left-4 z-10 px-4"
//       onClick={handleClick}
//     >
//       3D로 보기
//     </Button>
//   );
// };

export default function ResumeSelectMenuNormal() {
  return (
    <div className="w-full flex items-center justify-center px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center justify-center">
        <Image
          src="/kokomenReport.png"
          alt="kokomenReport"
          width={300}
          height={300}
          className="mx-auto w-3/4"
        />
        <div className="text-center space-y-2 mb-8">
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-3xl font-bold text-text-heading">
              맞춤형 이력서 서비스
            </h1>
            <p className="text-text-secondary text-lg">
              원하는 서비스를 선택해주세요
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-end justify-start gap-2">
              <MenuItem
                title="이력서와 포트폴리오 평가하기"
                description="기업의 공고와 직무를 고려해서 이력서와 포트폴리오를 분석하고 점수를 도출하고, 개선점을 제안해요."
                color="blue"
                link="/resume/eval"
                disabled={false}
              />
              <Link
                href={`/resume/eval/demo`}
                className="text-sm bg-primary text-text-light-solid px-4 py-2 font-bold rounded-md"
              >
                체험해보기
              </Link>
            </div>
            <Tooltip className="w-full flex flex-col items-end justify-start gap-2">
              <MenuItem
                title="이력서와 포트폴리오 기반 면접"
                description="기업의 공고와 직무를 고려해서 이력서와 포트폴리오를 기반 면접을 진행해요."
                color="green"
                link="/resume/interview"
                disabled={true}
              />
              <Tooltip.Content placement="top">
                곧 출시돼요! 조금만 기다려주세요 :)
              </Tooltip.Content>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}
