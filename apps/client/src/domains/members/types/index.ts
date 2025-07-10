type Feedback = {
  question_id: number;
  answer_id: number;
  question: string;
  answer: string;
  answer_rank: string;
  answer_feedback: string;
  answer_like_count: number;
  answer_already_liked: boolean;
};

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

type TMemberInterviewResultResponse = {
  feedbacks: Feedback[];
  total_feedback: string;
  total_score: number;
  interview_like_count: number;
  interview_already_liked: boolean;
};

type TMemberInterviewResult = {
  feedbacks: {
    questionId: number;
    answerId: number;
    question: string;
    answer: string;
    answerRank: string;
    answerFeedback: string;
    answerLikeCount: number;
    answerLiked: boolean;
  }[];
  totalFeedback: string;
  totalScore: number;
  interviewLikeCount: number;
  interviewAlreadyLiked: boolean;
};

const mapToMemberInterviewResult = (
  response: TMemberInterviewResultResponse
): TMemberInterviewResult => {
  return {
    feedbacks: response.feedbacks.map((feedback) => ({
      questionId: feedback.question_id,
      answerId: feedback.answer_id,
      question: feedback.question,
      answer: feedback.answer,
      answerRank: feedback.answer_rank,
      answerFeedback: feedback.answer_feedback,
      answerLikeCount: feedback.answer_like_count,
      answerLiked: feedback.answer_already_liked,
    })),
    totalFeedback: response.total_feedback,
    totalScore: response.total_score,
    interviewLikeCount: response.interview_like_count,
    interviewAlreadyLiked: response.interview_already_liked,
  };
};

export type {
  Feedback,
  Rank,
  TMemberInterview,
  TMemberInterviewResponse,
  TMemberInterviewResult,
  TMemberInterviewResultResponse,
};
export { MemberInterview, mapToMemberInterviewResult };
