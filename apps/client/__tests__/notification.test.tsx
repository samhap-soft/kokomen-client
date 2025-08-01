import "@testing-library/jest-dom";
import { renderWithProviders, server } from "@/utils/test-utils";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import NotificationPanelIcon from "@/domains/notifications/components/notificationPanel";
import { NotificationFactory, User } from "@kokomen/types";
import { mockPush } from "jest.setup";

const mockUnreadNotifications = [
  NotificationFactory.create(
    "INTERVIEW_LIKE",
    new Date().toISOString(),
    {
      interview_id: 1,
      liker_member_id: 2,
      like_count: 3
    },
    false
  ),
  NotificationFactory.create(
    "ANSWER_LIKE",
    new Date().toISOString(),
    {
      answer_id: 2,
      interview_id: 2,
      liker_member_id: 3,
      like_count: 1
    },
    false
  )
];

const mockUser: User = {
  id: 1,
  nickname: "테스트유저",
  profile_completed: true
};
const mockAsPath = "/";

describe("알림 패널 컴포넌트 테스트", () => {
  beforeEach(() => {
    server.resetHandlers();
    let unreadPage = 0;
    let readPage = 0;
    server.use(
      http.get(
        `${process.env.NEXT_PUBLIC_NOTIFICATION_API_BASE_URL}/notifications/me/unread`,
        () => {
          if (unreadPage === 1) {
            return HttpResponse.json({
              notifications: [
                {
                  notification_payload: {
                    notification_type: "INTERVIEW_LIKE",
                    interview_id: 1,
                    liker_member_id: 1,
                    like_count: 3
                  },
                  created_at: new Date().toISOString()
                }
              ],
              has_next: false
            });
          }

          unreadPage++;
          return HttpResponse.json({
            notifications: [
              ...mockUnreadNotifications,
              ...mockUnreadNotifications,
              ...mockUnreadNotifications,
              ...mockUnreadNotifications
            ],
            has_next: true
          });
        }
      )
    );

    server.use(
      http.get(
        `${process.env.NEXT_PUBLIC_NOTIFICATION_API_BASE_URL}/notifications/me/read`,
        () => {
          if (readPage === 1) {
            return HttpResponse.json({
              notifications: [
                {
                  notification_payload: {
                    notification_type: "INTERVIEW_LIKE",
                    interview_id: 1,
                    liker_member_id: 1,
                    like_count: 3
                  },
                  created_at: new Date().toISOString()
                }
              ],
              has_next: false
            });
          }

          readPage++;
          return HttpResponse.json({
            notifications: [
              ...mockUnreadNotifications,
              ...mockUnreadNotifications,
              ...mockUnreadNotifications,
              ...mockUnreadNotifications
            ],
            has_next: true
          });
        }
      )
    );
  });

  describe("로그인하지 않은 사용자 테스트", () => {
    it("로그인하지 않은 사용자가 알림 버튼을 클릭하면 로그인 페이지로 이동해야 한다", async () => {
      renderWithProviders(<NotificationPanelIcon user={null} />);

      const notificationButton = screen.getByRole("button");
      fireEvent.click(notificationButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith({
          pathname: "/login",
          query: {
            redirectTo: mockAsPath
          }
        });
      });
    });
  });

  describe("로그인한 사용자 테스트", () => {
    beforeEach(() => {
      // 읽은 알림 API 모킹
      server.use(
        http.get(
          `${process.env.NEXT_PUBLIC_NOTIFICATION_API_BASE_URL}/notifications/me/read`,
          () => {
            return HttpResponse.json({
              notifications: [
                {
                  notification_payload: {
                    notification_type: "ANSWER_LIKE",
                    answer_id: 1,
                    interview_id: 1,
                    liker_member_id: 1,
                    like_count: 5
                  },
                  created_at: new Date().toISOString()
                },
                {
                  notification_payload: {
                    notification_type: "INTERVIEW_VIEW_COUNT",
                    interview_id: 1,
                    view_count: 100
                  },
                  created_at: new Date().toISOString()
                },
                {
                  notification_payload: {
                    notification_type: "INTERVIEW_LIKE",
                    interview_id: 1,
                    liker_member_id: 2,
                    like_count: 3
                  },
                  created_at: new Date().toISOString()
                }
              ],
              has_next: false
            });
          }
        )
      );

      // 안읽은 알림 API 모킹
      server.use(
        http.get(
          `${process.env.NEXT_PUBLIC_NOTIFICATION_API_BASE_URL}/notifications/me/unread`,
          () => {
            return HttpResponse.json({
              notifications: [
                {
                  notification_payload: {
                    notification_type: "ANSWER_LIKE",
                    answer_id: 1,
                    interview_id: 1,
                    liker_member_id: 1,
                    like_count: 5
                  },
                  created_at: new Date().toISOString()
                },
                {
                  notification_payload: {
                    notification_type: "INTERVIEW_VIEW_COUNT",
                    interview_id: 1,
                    view_count: 100
                  },
                  created_at: new Date().toISOString()
                },
                {
                  notification_payload: {
                    notification_type: "INTERVIEW_LIKE",
                    interview_id: 1,
                    liker_member_id: 2,
                    like_count: 3
                  },
                  created_at: new Date().toISOString()
                }
              ],
              has_next: false
            });
          }
        )
      );
    });

    it("로그인한 사용자가 알림 버튼을 클릭하면 알림 패널이 열려야 한다", async () => {
      renderWithProviders(<NotificationPanelIcon user={mockUser} />);

      const notificationButton = screen.getByRole("button");
      fireEvent.click(notificationButton);

      await waitFor(() => {
        expect(screen.getByText("안읽은 알림")).toBeInTheDocument();
        expect(screen.getByText("읽은 알림")).toBeInTheDocument();
      });
    });

    it("기본적으로 안읽은 알림 탭이 활성화되어 있어야 한다", async () => {
      renderWithProviders(<NotificationPanelIcon user={mockUser} />);

      const notificationButton = screen.getByRole("button");
      fireEvent.click(notificationButton);

      await waitFor(() => {
        const unreadTab = screen.getByRole("button", { name: "안읽은 알림" });
        const readTab = screen.getByRole("button", { name: "읽은 알림" });

        expect(unreadTab).toHaveClass("bg-primary");
        expect(readTab).not.toHaveClass("bg-primary");
      });
    });

    it("읽은 알림 탭을 클릭하면 읽은 알림 목록이 표시되어야 한다", async () => {
      renderWithProviders(<NotificationPanelIcon user={mockUser} />);

      const notificationButton = screen.getByRole("button");
      fireEvent.click(notificationButton);

      await waitFor(() => {
        const readTab = screen.getByRole("button", { name: "읽은 알림" });
        fireEvent.click(readTab);
      });

      await waitFor(() => {
        expect(
          screen.getByText("내 면접에서의 답변이 좋아요를 받았어요. (총 5개)")
        ).toBeInTheDocument();
      });
    });

    it("안읽은 알림 탭을 클릭하면 안읽은 알림 목록이 표시되어야 한다", async () => {
      renderWithProviders(<NotificationPanelIcon user={mockUser} />);

      const notificationButton = screen.getByRole("button");
      fireEvent.click(notificationButton);

      await waitFor(() => {
        const unreadTab = screen.getByRole("button", { name: "안읽은 알림" });
        fireEvent.click(unreadTab);
      });

      await waitFor(() => {
        expect(
          screen.getByText("내 면접이 좋아요를 받았어요. (총 3개)")
        ).toBeInTheDocument();
      });
    });

    it("알림이 없을 때 적절한 메시지가 표시되어야 한다", async () => {
      // 빈 알림 목록으로 API 모킹
      server.use(
        http.get(
          `${process.env.NEXT_PUBLIC_NOTIFICATION_API_BASE_URL}/notifications/me/unread`,
          () => {
            return HttpResponse.json({
              notifications: [],
              has_next: false
            });
          }
        )
      );

      renderWithProviders(<NotificationPanelIcon user={mockUser} />);

      const notificationButton = screen.getByRole("button");
      fireEvent.click(notificationButton);

      await waitFor(() => {
        expect(screen.getByText("안읽은 알림이 없습니다.")).toBeInTheDocument();
      });
    });
  });

  describe("알림 메시지 테스트", () => {
    it("답변 좋아요 알림이 올바른 메시지를 표시해야 한다", () => {
      const answerLikeNotification = NotificationFactory.create(
        "ANSWER_LIKE",
        new Date().toISOString(),
        {
          answer_id: 1,
          interview_id: 1,
          liker_member_id: 1,
          like_count: 10
        }
      );

      expect(answerLikeNotification.getMessage()).toBe(
        "내 면접에서의 답변이 좋아요를 받았어요. (총 10개)"
      );
    });

    it("면접 조회수 알림이 올바른 메시지를 표시해야 한다", () => {
      const viewCountNotification = NotificationFactory.create(
        "INTERVIEW_VIEW_COUNT",
        new Date().toISOString(),
        {
          interview_id: 1,
          view_count: 50
        }
      );

      expect(viewCountNotification.getMessage()).toBe(
        "내 면접이 50번 조회됐어요."
      );
    });

    it("면접 좋아요 알림이 올바른 메시지를 표시해야 한다", () => {
      const interviewLikeNotification = NotificationFactory.create(
        "INTERVIEW_LIKE",
        new Date().toISOString(),
        {
          interview_id: 1,
          liker_member_id: 1,
          like_count: 7
        }
      );

      expect(interviewLikeNotification.getMessage()).toBe(
        "내 면접이 좋아요를 받았어요. (총 7개)"
      );
    });
  });

  describe("API 에러 처리 테스트", () => {
    it("알림 API 호출이 실패했을 때 적절히 처리되어야 한다", async () => {
      server.use(
        http.get(
          `${process.env.NEXT_PUBLIC_NOTIFICATION_API_BASE_URL}/notifications/me/unread`,
          () => {
            return HttpResponse.json({ error: "서버 오류" }, { status: 500 });
          }
        )
      );

      renderWithProviders(<NotificationPanelIcon user={mockUser} />);

      const notificationButton = screen.getByRole("button");
      fireEvent.click(notificationButton);

      // 에러가 발생해도 컴포넌트가 크래시되지 않아야 함
      await waitFor(() => {
        expect(screen.getByText("안읽은 알림")).toBeInTheDocument();
      });
    });
  });
});

describe("접근성 테스트", () => {
  it("알림 버튼이 키보드로 접근 가능해야 한다", async () => {
    renderWithProviders(<NotificationPanelIcon user={mockUser} />);

    const notificationButton = screen.getByRole("button");

    expect(notificationButton).toHaveAttribute("tabindex", "0");

    // Enter 키로 클릭 가능
    fireEvent.keyDown(notificationButton, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(screen.getByText("안읽은 알림")).toBeInTheDocument();
      screen.debug();
    });
  });
});
