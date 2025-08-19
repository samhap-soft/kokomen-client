import { Button } from "@kokomen/ui";
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

  return (
    <Button
      onClick={handleFeedbackButtonClick}
      className="fixed bottom-5 right-5 z-50 w-15 h-15 bg-orange-3 hover:bg-orange-5 animate-bounce"
      round
    >
      <Image
        src="/hurray.svg"
        alt="feedback"
        width={20}
        height={20}
        className="absolute top-0 left-0 w-full"
      />
    </Button>
  );
};

export default FeedbackButton;
