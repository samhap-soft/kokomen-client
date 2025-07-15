import { AnswerMemo } from "@/domains/interviewReport/types/memo";
import axios, { AxiosInstance, AxiosResponse } from "axios";

const answerMemoApiInstance: AxiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}/answers`,
  withCredentials: true,
});

const createNewAnswerMemo = async (
  answerId: number,
  memo: AnswerMemo
): Promise<AxiosResponse> => {
  return answerMemoApiInstance.post(`/${answerId}/memo`, {
    content: memo.content,
    visibility: memo.visibility,
  });
};

const updateAnswerMemo = async (
  answerId: number,
  memo: AnswerMemo
): Promise<AxiosResponse> => {
  return answerMemoApiInstance.patch(`/${answerId}/memo`, {
    content: memo.content,
    visibility: memo.visibility,
  });
};

const deleteAnswerMemo = async (answerId: number): Promise<AxiosResponse> => {
  return answerMemoApiInstance.delete(`/${answerId}/memo`);
};

export { createNewAnswerMemo, updateAnswerMemo, deleteAnswerMemo };
