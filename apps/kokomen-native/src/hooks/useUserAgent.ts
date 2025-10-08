import { useEffect, useState } from "react";
import { Platform } from "react-native";

export default function useUserAgent() {
  const [userAgent, setUserAgent] = useState("");

  useEffect(() => {
    // 웹뷰에서 유저 에이전트를 가져오고 플랫폼에 맞게 처리
    const getUserAgent = async () => {
      const defaultUserAgent = navigator.userAgent;

      // 플랫폼에 맞게 유저 에이전트 수정
      const modifiedAgent =
        Platform.OS === "ios"
          ? defaultUserAgent + " Safari/604.1" // iOS의 경우 Safari 정보 추가
          : defaultUserAgent?.substring(0, defaultUserAgent?.indexOf("Chrome")); // Android의 경우 Chrome 이후 제거

      setUserAgent(modifiedAgent); // 수정된 유저 에이전트 설정
    };

    getUserAgent(); // 유저 에이전트 가져오기
  }, []);
  return userAgent;
}
