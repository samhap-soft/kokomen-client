import {
  CamelCasedProperties,
  PaginatedRecruitList,
  RecruitFilterRequest,
  RecruitFilters
} from "@kokomen/types";
import axios, { AxiosInstance } from "axios";
import { mapToCamelCase, ParamSerializer } from "@kokomen/utils";

const recruitInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL + "/recruits",
  withCredentials: true
});

export const getRecruitFilters = (): Promise<RecruitFilters> => {
  return recruitInstance
    .get<RecruitFilters>("/filters")
    .then((res) => mapToCamelCase(res.data));
};

export const getPaginatedRecruitList = async ({
  page,
  size = 20,
  ...filters
}: RecruitFilterRequest & { page: number; size: number }): Promise<
  CamelCasedProperties<PaginatedRecruitList>
> => {
  return recruitInstance
    .get<PaginatedRecruitList>("", {
      params: {
        page,
        size,
        careerMin: filters.careerMin,
        careerMax: filters.careerMax,
        region: filters.region,
        employeeType: filters.employeeType,
        education: filters.education,
        employment: filters.employment,
        deadlineType: filters.deadlineType
      },
      paramsSerializer: ParamSerializer.serialize
    })
    .then((res) => mapToCamelCase(res.data));
};
