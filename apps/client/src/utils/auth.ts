import { isAxiosError } from "axios";
import { GetServerSidePropsResult, GetServerSidePropsContext } from "next";

const LOGIN_PATH: string = "/login";
export async function withCheckInServer<T>(
  fetchCall: () => Promise<GetServerSidePropsResult<T> | { data: T }>,
  options?: {
    // 404 대신 다른 처리를 원할 때
    onError?: (
      // eslint-disable-next-line no-unused-vars
      error: unknown,
      // eslint-disable-next-line no-unused-vars
      context?: GetServerSidePropsContext
    ) => GetServerSidePropsResult<T>;
    // 에러 로깅 비활성화
    context?: GetServerSidePropsContext;
  }
): Promise<GetServerSidePropsResult<T>> {
  const { onError, context } = options || {};

  try {
    // fetchCall이 함수인지 확인
    if (typeof fetchCall !== "function") {
      throw new Error("fetchCall must be a function that returns a Promise");
    }

    const response = await fetchCall();

    // 이미 GetServerSidePropsResult 형태인 경우 (redirect, notFound 등)
    if (
      response &&
      typeof response === "object" &&
      ("redirect" in response || "notFound" in response)
    ) {
      return response as GetServerSidePropsResult<T>;
    }

    // AxiosResponse 형태인 경우 (data 속성이 있는 경우)
    if (response && typeof response === "object" && "data" in response) {
      return {
        props: response.data as T,
      };
    }

    // 직접 T 타입인 경우
    return {
      props: response as T,
    };
  } catch (error) {
    if (isAxiosError(error)) {
      const status = error.response?.status;

      switch (status) {
        case 401:
        case 403:
          return {
            redirect: {
              destination: LOGIN_PATH,
              permanent: false,
            },
          };
        case 404:
          return {
            notFound: true,
          };

        case 500:
          return {
            redirect: {
              destination: "/500",
              permanent: false,
            },
          };
      }
    }

    // 커스텀 에러 핸들러가 있는 경우
    if (onError) {
      return onError(error, context);
    }

    // 기본 처리: 404
    return {
      redirect: {
        destination: "/500",
        permanent: false,
      },
    };
  }
}

// 사용 예시:
/*
// 1. 기본 사용법
export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  return withCheckInServer(
    () => api.getUserProfile(context.params?.userId as string),
    { context }
  );
};

// 2. 커스텀 옵션 사용
export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  return withCheckInServer(
    () => api.getAdminData(),
    {
      loginPath: "/admin/login",
      context,
      onError: (error) => ({
        redirect: {
          destination: "/admin/error",
          permanent: false,
        },
      }),
    }
  );
};

// 3. 헬퍼 함수 사용
const fetchUserData = createAuthenticatedFetcher(() => api.getUserData());

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  return fetchUserData({ context });
};
*/
