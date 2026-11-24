import Image from "next/image";
import { useRouter } from "next/router";

const FeedbackButton = () => {
  const router = useRouter();
  const handleFeedbackButtonClick = () => {
    window.open("https://open.kakao.com/o/sE3WgnNh", "_blank");
  };

  if (router.pathname.startsWith("/interviews/")) {
    return null;
  }

  // 이미지 모서리에 회색 배경이 있어서 원으로 잘라 보여준다(Figma 1198:2468)
  return (
    <button
      type="button"
      onClick={handleFeedbackButtonClick}
      aria-label="문의하기"
      className="fixed bottom-5 right-5 z-50 size-15 cursor-pointer overflow-hidden rounded-full shadow-lg transition-transform hover:scale-105 animate-bounce"
    >
      <Image
        src="/kokobot/inquiry.png"
        alt=""
        width={60}
        height={54}
        className="size-full object-cover"
      />
    </button>
  );
};

export default FeedbackButton;
