// 알림 타입 정의
export type NotificationType =
  | "ANSWER_LIKE"
  | "INTERVIEW_VIEW_COUNT"
  | "INTERVIEW_LIKE";

// 기본 알림 인터페이스
export interface BaseNotificationInterface {
  type: NotificationType;
  createdAt: string;
  isRead: boolean;
  getMessage(): string;
}

// 알림 상세 정보 타입
export type NotificationDetails =
  | {
      notification_type: "ANSWER_LIKE";
      answer_id: number;
      interview_id: number;
      liker_member_id: number;
      like_count: number;
    }
  | {
      notification_type: "INTERVIEW_VIEW_COUNT";
      interview_id: number;
      view_count: number;
    }
  | {
      notification_type: "INTERVIEW_LIKE";
      interview_id: number;
      liker_member_id: number;
      like_count: number;
    };

// 기본 알림 추상 클래스
export abstract class BaseNotification implements BaseNotificationInterface {
  public type: NotificationType;
  public createdAt: string;
  public isRead: boolean;

  constructor(
    type: NotificationType,
    createdAt: string,
    isRead: boolean = false
  ) {
    this.type = type;
    this.createdAt = createdAt;
    this.isRead = isRead;
  }

  abstract getMessage(): string;
}

// 답변 좋아요 알림 클래스
export class AnswerLikeNotification extends BaseNotification {
  public answerId: number;
  public interviewId: number;
  public likerMemberId: number;
  public likeCount: number;

  constructor(
    createdAt: string,
    answerId: number,
    interviewId: number,
    likerMemberId: number,
    likeCount: number,
    isRead: boolean = false
  ) {
    super("ANSWER_LIKE", createdAt, isRead);
    this.answerId = answerId;
    this.interviewId = interviewId;
    this.likerMemberId = likerMemberId;
    this.likeCount = likeCount;
  }

  getMessage(): string {
    return `내 면접에서의 답변이 좋아요를 받았어요. (총 ${this.likeCount}개)`;
  }
}

// 인터뷰 조회수 알림 클래스
export class InterviewViewCountNotification extends BaseNotification {
  public interviewId: number;
  public viewCount: number;

  constructor(
    createdAt: string,
    interviewId: number,
    viewCount: number,
    isRead: boolean = false
  ) {
    super("INTERVIEW_VIEW_COUNT", createdAt, isRead);
    this.interviewId = interviewId;
    this.viewCount = viewCount;
  }

  getMessage(): string {
    return `내 면접이 ${this.viewCount}번 조회됐어요.`;
  }
}

// 인터뷰 좋아요 알림 클래스
export class InterviewLikeNotification extends BaseNotification {
  public interviewId: number;
  public likerMemberId: number;
  public likeCount: number;

  constructor(
    createdAt: string,
    interviewId: number,
    likerMemberId: number,
    likeCount: number,
    isRead: boolean = false
  ) {
    super("INTERVIEW_LIKE", createdAt, isRead);
    this.interviewId = interviewId;
    this.likerMemberId = likerMemberId;
    this.likeCount = likeCount;
  }

  getMessage(): string {
    return `내 면접이 좋아요를 받았어요. (총 ${this.likeCount}개)`;
  }
}

// 알림 팩토리 클래스
export class NotificationFactory {
  static create(
    type: string,
    createdAt: string,
    details: any,
    isRead: boolean = false
  ): BaseNotification {
    switch (type) {
      case "ANSWER_LIKE":
        return new AnswerLikeNotification(
          createdAt,
          details.answer_id,
          details.interview_id,
          details.liker_member_id,
          details.like_count,
          isRead
        );
      case "INTERVIEW_VIEW_COUNT":
        return new InterviewViewCountNotification(
          createdAt,
          details.interview_id,
          details.view_count,
          isRead
        );
      case "INTERVIEW_LIKE":
        return new InterviewLikeNotification(
          createdAt,
          details.interview_id,
          details.liker_member_id,
          details.like_count,
          isRead
        );
      default:
        throw new Error(`Unknown notification type: ${type}`);
    }
  }
}

// 알림 관련 유틸리티 타입들
export type NotificationList = BaseNotification[];
export type Notifications =
  | AnswerLikeNotification
  | InterviewLikeNotification
  | InterviewViewCountNotification;
