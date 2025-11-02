import { MemberInterview, MemberInterviewResult, Rank } from "@kokomen/types";
import {
  CamelCasedProperties,
  mapToCamelCase
} from "@/utils/convertConvention";
import axios, { AxiosInstance } from "axios";
import { GetServerSidePropsContext } from "next";

const memberInstance: AxiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}`,
  withCredentials: true
});

const getRankList = async (
  page = 0,
  size = 10
): Promise<CamelCasedProperties<Rank>[]> => {
  return memberInstance
    .get<Rank[]>("/members/ranking", {
      params: { page, size }
    })
    .then((res) => res.data.map(mapToCamelCase));
};

const getMemberInterviews = async (
  memberId: number,
  page = 0,
  sort = "desc",
  size = 10
): Promise<CamelCasedProperties<MemberInterview>> =>
  memberInstance
    .get<MemberInterview>("/interviews", {
      params: { member_id: memberId, page, size, sort: `id,${sort}` }
    })
    .then((res) => res.data)
    .then(mapToCamelCase);

const getMemberInterviewResult = async (
  interviewId: number,
  context: GetServerSidePropsContext
): Promise<CamelCasedProperties<MemberInterviewResult>> =>
  memberInstance
    .get<MemberInterviewResult>(`/interviews/${interviewId}/result`, {
      headers: {
        cookie: context.req.headers.cookie,
        "X-Forwarded-For": context.req.headers["x-real-ip"]
      }
    })
    .then((res) => res.data)
    .then(mapToCamelCase);

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
  toggleMemberInterviewAnswerLike
};
