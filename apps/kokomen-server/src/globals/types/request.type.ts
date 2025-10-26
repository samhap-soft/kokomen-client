import { Request } from "express";
import { Member } from "src/member/domains/member";

export interface AuthenticatedRequest extends Request {
  member: Member;
  cookies: {
    JSESSIONID?: string;
    [key: string]: string | undefined;
  };
}
