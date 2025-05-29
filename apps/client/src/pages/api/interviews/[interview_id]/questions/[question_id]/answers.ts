import { submitInterviewAnswer } from "@/domains/interview/api/interviewAnswer";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log(req.body);
    const { data } = await submitInterviewAnswer(req.body);
    res.status(200).json(data);
  } catch {
    res.status(500).json({ error: "Failed to submit answer" });
  }
}
