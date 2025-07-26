import {
  MemberInterview,
  MemberInterviewResult,
  Rank
} from "@kokomen/types/members";
import {
  CamelCasedProperties,
  mapToCamelCase
} from "@kokomen/utils/general/convertConvention";
import axios, { AxiosInstance } from "axios";

const memberInstance: AxiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}`,
  withCredentials: true
});

const getRankList = async (
  page = 0,
  size = 5
): Promise<CamelCasedProperties<Rank>[]> => {
  const response = await memberInstance.get("/members/ranking", {
    params: { page, size }
  });
  return response.data;
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
  interviewId: number
): Promise<CamelCasedProperties<MemberInterviewResult>> =>
  memberInstance
    .get<MemberInterviewResult>(`/interviews/${interviewId}/result`)
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
