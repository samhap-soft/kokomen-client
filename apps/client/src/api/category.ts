import { serverInstance } from "@/api";

interface ICategoryResponse {
  categories: Array<string>;
}
const getCategories = async (): Promise<ICategoryResponse> => {
  const { data } = await serverInstance.get<ICategoryResponse>("/categories");
  return data;
};

export { getCategories };
