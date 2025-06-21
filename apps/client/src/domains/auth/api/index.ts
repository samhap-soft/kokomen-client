import { serverInstance } from "@/api";
import { AxiosPromise } from "axios";

interface KakaoLoginResponse {
  id: number;
  nickname: string;
}

const postAuthorizationCode = async (
  code: string,
  redirectUri: string
): AxiosPromise<KakaoLoginResponse> => {
  return serverInstance.post(
    `/auth/kakao-login`,
    {
      code,
      redirect_uri: redirectUri,
    },
    { withCredentials: true }
  );
};

export { postAuthorizationCode };
