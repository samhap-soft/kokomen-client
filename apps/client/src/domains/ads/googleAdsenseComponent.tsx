import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle: any;
  }
}

export const GoogleAdSenseComponent = () => {
  useEffect(() => {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client="ca-pub-9998347148036420"
      data-ad-slot="4601910391"
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
};
