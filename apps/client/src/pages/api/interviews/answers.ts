import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

const MAX_RETRY: number = 20;
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  console.log("post start");

  axios
    .post(
      `${process.env.NEXT_PUBLIC_V2_API_BASE_URL}/interviews/${req.query.interviewId}/questions/${req.query.questionId}/answers`,
      {
        answer: req.body.answer
      },
      {
        headers: {
          "Content-Type": "application/json",
          Cookie: req.headers.cookie
        }
      }
    )
    .then(async () => {
      try {
        let retry = 0;
        while (retry < MAX_RETRY) {
          const getResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_V2_API_BASE_URL}/interviews/${req.query.interviewId}/questions/${req.query.questionId}`,
            {
              headers: {
                "Content-Type": "application/json",
                Cookie: req.headers.cookie
              }
            }
          );
          if (getResponse.data.llm_proceed_state === "COMPLETED") {
            if (getResponse.data.interview_state === "FINISHED") {
              // 면접 종료시
              return res.status(204).end();
            }
            // 면접 진행중
            return res.status(200).json(getResponse.data);
          }

          // 폴링 중 서버 오류가 발생했을 경우
          if (getResponse.data.llm_proceed_state === "FAILED") {
            return res.status(500).json(getResponse.data);
          }
          retry++;
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        // 최대 폴링 횟수 도달 시 에러 반환
        res.status(408).json({ message: "서버에 오류가 발생했습니다." });
      } catch (error) {
        // 폴링 중 오류가 발생했을 경우
        return res
          .status(503)
          .json({ message: "서버에 오류가 발생했습니다.", error });
      }
    })
    .catch((error) => {
      return res
        .status(500)
        .json({ message: "서버에 오류가 발생했습니다.", error });
    });
}
