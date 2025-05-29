import { submitInterviewAnswer } from "@/domains/interview/api/interviewAnswer";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log(req.body);
    const { data } = await submitInterviewAnswer(req.body);
    if (!data) return res.status(204).json({ message: "No content" });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to submit answer" });
  }
}
