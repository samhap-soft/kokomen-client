import { User } from "@kokomen/types/auth";
import axios, { AxiosInstance, AxiosPromise } from "axios";

const authServerInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true
});

interface KakaoLoginResponse {
  id: number;
  nickname: string;
  profile_completed: boolean;
}

const postAuthorizationCode = async (
  code: string,
  redirectUri: string
): AxiosPromise<KakaoLoginResponse> => {
  return authServerInstance.post(`/auth/kakao-login`, {
    code,
    redirect_uri: redirectUri
  });
};

const getUserInfo = async (): AxiosPromise<User> => {
  return authServerInstance.get(`/members/me/profile`);
};

const logout = async (): AxiosPromise<void> => {
  return authServerInstance.post(
    `/api/auth/logout`,
    {},
    {
      withCredentials: true
    }
  );
};

const updateUserProfile = async (nickname: string): AxiosPromise<void> => {
  return authServerInstance.patch(`/members/me/profile`, { nickname });
};

export { postAuthorizationCode, getUserInfo, logout, updateUserProfile };
