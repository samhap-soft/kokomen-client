import {
  AdminPaymentPageResponse,
  CamelCasedProperties,
  InterviewQuestion
} from "@kokomen/types";
import axios, { AxiosInstance } from "axios";
import { mapToCamelCase } from "@kokomen/utils";

const adminApiInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL
});

export const getAdminQuestions = async (
  category: string
): Promise<CamelCasedProperties<InterviewQuestion[]>> => {
  return adminApiInstance
    .get<InterviewQuestion[]>(`/interview/questions?category=${category}`)
    .then((res) => res.data)
    .then(mapToCamelCase);
};

export const getAdminPayments = async (
  page: number = 0
): Promise<CamelCasedProperties<AdminPaymentPageResponse>> => {
  return adminApiInstance
    .get<AdminPaymentPageResponse>(`/admin/payments?page=${page}`)
    .then((res) => res.data)
    .then(mapToCamelCase);
};

export const cancelAdminPayment = async (paymentId: number): Promise<void> => {
  return adminApiInstance
    .post(`/admin/payments/${paymentId}/cancel`)
    .then((res) => res.data);
};

// TODO: 질문 수정 API (서버 구현 후 활성화)
// export const updateAdminQuestion = async (
//   questionId: number,
//   content: string
// ): Promise<void> => {
//   return adminApiInstance
//     .put(`/admin/questions/${questionId}`, { content })
//     .then((res) => res.data);
// };

// TODO: 질문 삭제 API (서버 구현 후 활성화)
// export const deleteAdminQuestion = async (
//   questionId: number
// ): Promise<void> => {
//   return adminApiInstance
//     .delete(`/admin/questions/${questionId}`)
//     .then((res) => res.data);
// };
