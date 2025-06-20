import { serverInstance } from "@/api";
import { AxiosPromise } from "axios";

interface KakaoLoginResponse {
  id: number;
  nickname: string;
}

const postAuthorizationCode = async (
  code: string,
  redirect_uri: string
): AxiosPromise<KakaoLoginResponse> => {
  return serverInstance.post(
    `/auth/kakao-login`,
    {
      code,
      redirect_uri,
    },
    { withCredentials: true }
  );
};

export { postAuthorizationCode };
