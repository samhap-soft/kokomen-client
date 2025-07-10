import {
  mapToMemberInterviewResult,
  MemberInterview,
  Rank,
  TMemberInterviewResponse,
  TMemberInterviewResult,
  TMemberInterviewResultResponse,
} from "@/domains/members/types";
import axios, { AxiosInstance } from "axios";
import { GetServerSidePropsContext } from "next";

const memberInstance: AxiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}`,
  withCredentials: true,
});

const getRankList = async (page = 0, size = 10): Promise<Rank[]> => {
  const response = await memberInstance.get("/members/ranking", {
    params: { page, size },
  });
  return response.data;
};

const getMemberInterviews = async (
  memberId: number,
  page = 0,
  sort = "desc",
  size = 10
): Promise<MemberInterview[]> =>
  memberInstance
    .get<TMemberInterviewResponse[]>("/interviews", {
      params: { member_id: memberId, page, size, sort: `id,${sort}` },
    })
    .then((res) => res.data)
    .then((data) => data.map((interview) => new MemberInterview(interview)));

const getMemberInterviewResult = async (
  interviewId: number,
  context: GetServerSidePropsContext
): Promise<TMemberInterviewResult> =>
  memberInstance
    .get<TMemberInterviewResultResponse>(`/interviews/${interviewId}/result`, {
      headers: {
        cookie: context.req.headers.cookie,
      },
    })
    .then((res) => res.data)
    .then((data) => mapToMemberInterviewResult(data));

const toggleMemberInterviewLike = async (
  liked: boolean,
  interviewId: number
): Promise<void> => {
  if (liked) {
    return memberInstance.delete(`/interviews/${interviewId}/like`);
  } else {
    return memberInstance.post(`/interviews/${interviewId}/like`);
  }
};

const toggleMemberInterviewAnswerLike = async (
  liked: boolean,
  answerId: number
): Promise<void> => {
  if (liked) {
    return memberInstance.delete(`/answers/${answerId}/like`);
  } else {
    return memberInstance.post(`/answers/${answerId}/like`);
  }
};

export {
  getRankList,
  getMemberInterviews,
  getMemberInterviewResult,
  toggleMemberInterviewLike,
  toggleMemberInterviewAnswerLike,
};
