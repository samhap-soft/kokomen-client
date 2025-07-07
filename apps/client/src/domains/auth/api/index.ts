import { serverInstance } from "@/api";
import { User } from "@/domains/auth/types";
import axios, { AxiosInstance, AxiosPromise } from "axios";
import { GetServerSidePropsContext } from "next";

const authServerInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
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
  return serverInstance.post(
    `/auth/kakao-login`,
    {
      code,
      redirect_uri: redirectUri,
    },
    { withCredentials: true }
  );
};

const getUserInfo = async (
  context: GetServerSidePropsContext
): AxiosPromise<User> => {
  return authServerInstance.get(`/members/me/profile`, {
    headers: {
      Cookie: context.req.headers.cookie,
    },
  });
};

const logout = async (): AxiosPromise<void> => {
  return axios.post(
    `/api/auth/logout`,
    {},
    {
      withCredentials: true,
    }
  );
};

const updateUserProfile = async (nickname: string): AxiosPromise<void> => {
  return authServerInstance.patch(`/members/me/profile`, { nickname });
};

export { postAuthorizationCode, getUserInfo, logout, updateUserProfile };
