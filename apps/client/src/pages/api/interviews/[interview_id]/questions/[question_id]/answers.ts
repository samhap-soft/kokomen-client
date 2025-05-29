import { submitInterviewAnswer } from "@/domains/interview/api/interviewAnswer";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { data, status } = await submitInterviewAnswer(req.body);
    if (status === 204) return res.status(204).json({ message: "No content" });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to submit answer" });
  }
}
