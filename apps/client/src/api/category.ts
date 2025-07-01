import { serverInstance } from "@/api";
import { AxiosPromise } from "axios";

type Category = {
  key: string;
  title: string;
  description: string;
  image_url: string;
};
const getCategories = async (): AxiosPromise<Category[]> => {
  return serverInstance.get<Category[]>("/categories");
};

export { getCategories };
export type { Category };
