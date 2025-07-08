import { Rank } from "@/domains/members/types";
import axios, { AxiosInstance } from "axios";

const memberInstance: AxiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}/members`,
  withCredentials: true,
});

const getRankList = async (page = 0, size = 10): Promise<Rank[]> => {
  const response = await memberInstance.get("/ranking", {
    params: { page, size },
  });
  return response.data;
};

export { getRankList };
