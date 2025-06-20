import axios from "axios";

const serverInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

export { serverInstance };
