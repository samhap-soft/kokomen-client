import { Category } from "@kokomen/types";
import axios, { AxiosInstance } from "axios";

const categoryInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
});
const getCategories = async (): Promise<Category[]> => {
  return categoryInstance
    .get<Category[]>("/categories")
    .then((res) => res.data);
};

export { getCategories };
