import { Button } from "@kokomen/ui/components/button";
import { MessageCircleHeart } from "lucide-react";
import { useRouter } from "next/router";

const FeedbackButton = () => {
  const router = useRouter();
  const handleFeedbackButtonClick = () => {
    window.open("https://forms.gle/8WkaCYJQR1kzGGDN8", "_blank");
  };

  if (router.pathname.startsWith("/interviews/")) {
    return null;
  }

  return (
    <Button
      onClick={handleFeedbackButtonClick}
      className="fixed bottom-5 right-5 z-50 w-15 h-15 bg-orange-3 hover:bg-orange-5"
      round
    >
      <MessageCircleHeart className="w-7 h-7" />
    </Button>
  );
};

export default FeedbackButton;
