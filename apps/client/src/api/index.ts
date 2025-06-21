import axios, { AxiosInstance } from "axios";

const serverInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

export { serverInstance };
