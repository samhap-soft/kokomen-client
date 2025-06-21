import { interviewApiInstance } from "@/domains/interview/api";
import { InterviewReport } from "@/domains/interviewReport/types";
import { GetServerSidePropsContext, PreviewData } from "next";
import { ParsedUrlQuery } from "querystring";

interface PageParams extends ParsedUrlQuery {
  interview_id: string;
}
function getInterviewReport(
  cookies: GetServerSidePropsContext<PageParams, PreviewData>["req"]["cookies"],
  interview_id: string
) {
  return interviewApiInstance.get<InterviewReport>(
    `/interviews/${interview_id}/result`,
    {
      headers: {
        Cookie: Object.entries(cookies)
          .map(([key, value]) => `${key}=${value}`)
          .join("; "),
      },
    }
  );
}

export { getInterviewReport };
