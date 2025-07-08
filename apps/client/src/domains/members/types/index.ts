type Rank = {
  id: number;
  nickname: string;
  score: number;
  finished_interview_count: number;
};

type TMemberInterviewResponse = {
  interview_id: number;
  interview_state: "FINISHED";
  interview_category: string;
  created_at: string;
  root_question: string;
  max_question_count: number;
  score: number;
};

type TMemberInterview = {
  interviewId: number;
  interviewState: "FINISHED";
  interviewCategory: string;
  createdAt: string;
  rootQuestion: string;
  maxQuestionCount: number;
  score: number;
};

class MemberInterview implements TMemberInterview {
  public interviewId: number;
  public interviewState: "FINISHED";
  public interviewCategory: string;
  public createdAt: string;
  public rootQuestion: string;
  public maxQuestionCount: number;
  public score: number;

  public constructor(interview: TMemberInterviewResponse) {
    this.interviewId = interview.interview_id;
    this.interviewState = interview.interview_state;
    this.interviewCategory = interview.interview_category;
    this.createdAt = interview.created_at;
    this.rootQuestion = interview.root_question;
    this.maxQuestionCount = interview.max_question_count;
    this.score = interview.score;
  }

  public get formattedCreatedDate(): string {
    return new Date(this.createdAt).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
}

export type { Rank, TMemberInterview, TMemberInterviewResponse };
export { MemberInterview };
