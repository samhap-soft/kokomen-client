import {
  MemberInterview,
  Rank,
  TMemberInterviewResponse,
} from "@/domains/members/types";
import axios, { AxiosInstance } from "axios";

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

export { getRankList, getMemberInterviews };
