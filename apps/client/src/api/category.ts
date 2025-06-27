import { serverInstance } from "@/api";
import { AxiosPromise } from "axios";

interface ICategoryResponse {
  categories: Array<string>;
}
const getCategories = async (): AxiosPromise<ICategoryResponse> => {
  return serverInstance.get<ICategoryResponse>("/categories");
};

export { getCategories };
