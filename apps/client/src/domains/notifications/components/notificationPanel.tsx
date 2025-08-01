import { Bell } from "lucide-react";
import { Button, RoundSpinner } from "@kokomen/ui";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  notificationKeys,
  useModal,
  useIntersectionObserver
} from "@kokomen/utils";
import {
  getInfiniteReadNotifications,
  getInfiniteUnreadNotifications
} from "@/domains/notifications/api";
import { BaseNotification, User } from "@kokomen/types";
import { KeyboardEvent, useRef, useState } from "react";
import { useRouter } from "next/router";

const NotificationPanel = ({
  readNotifications,
  unreadNotifications,
  hasNextPageRead,
  hasNextPageUnread,
  isFetchingNextPageRead,
  isFetchingNextPageUnread,
  fetchNextPageRead,
  fetchNextPageUnread
}: {
  readNotifications: BaseNotification[];
  unreadNotifications: BaseNotification[];
  hasNextPageRead: boolean;
  hasNextPageUnread: boolean;
  isFetchingNextPageRead: boolean;
  isFetchingNextPageUnread: boolean;
  fetchNextPageRead: () => void;
  fetchNextPageUnread: () => void;
}) => {
  const [showReadNotifications, setShowReadNotifications] =
    useState<boolean>(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useIntersectionObserver(loadMoreRef, () => {
    showReadNotifications ? fetchNextPageRead() : fetchNextPageUnread();
  });

  const handleReadTabClick = () => setShowReadNotifications(true);
  const handleUnreadTabClick = () => setShowReadNotifications(false);

  const currentNotifications = showReadNotifications
    ? readNotifications
    : unreadNotifications;
  const hasNextPage = showReadNotifications
    ? hasNextPageRead
    : hasNextPageUnread;
  const isFetchingNextPage = showReadNotifications
    ? isFetchingNextPageRead
    : isFetchingNextPageUnread;

  return (
    <div
      role="dialog"
      className="absolute top-10 right-0 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
    >
      {/* 탭 버튼 */}
      <div className="flex border-b border-gray-200">
        <Button
          variant={!showReadNotifications ? "primary" : "text"}
          size="small"
          onClick={handleUnreadTabClick}
          className="flex-1 p-4 text-base rounded-b-none"
        >
          안읽은 알림
        </Button>
        <Button
          variant={showReadNotifications ? "primary" : "text"}
          size="small"
          onClick={handleReadTabClick}
          className="flex-1 border-r border-gray-200 p-4 text-base rounded-b-none"
        >
          읽은 알림
        </Button>
      </div>

      {/* 알림 목록 */}
      <div className="max-h-96 overflow-y-auto">
        {currentNotifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {showReadNotifications
              ? "읽은 알림이 없습니다."
              : "안읽은 알림이 없습니다."}
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {currentNotifications.map((notification, index) => (
              <div
                key={`${notification.type}-${notification.createdAt}-${index}`}
                className={`p-3 border-b border-gray-100 last:border-b-0 hover:bg-primary-bg cursor-pointer ${
                  !notification.isRead && "bg-primary-bg-hover"
                }`}
              >
                <div className="text-sm text-text-primary mb-1">
                  {notification.getMessage()}
                </div>
                <div className="text-xs text-text-secondary">
                  {new Date(notification.createdAt).toLocaleDateString(
                    "ko-KR",
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    }
                  )}
                </div>
              </div>
            ))}

            {/* 더보기 버튼 */}
            <div
              ref={loadMoreRef}
              className="h-10 flex justify-center items-center"
            >
              {!hasNextPage && !isFetchingNextPage && (
                <span className="text-text-secondary text-sm">
                  모든 알림을 불러왔어요.
                </span>
              )}
              {isFetchingNextPage && (
                <span className="text-text-secondary text-sm">
                  <RoundSpinner />
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const NotificationPanelIcon = ({ user }: { user: User | null }) => {
  const {
    isOpen,
    toggleModal: toggleNotificationPanel,
    modalRef: notificationPanelRef
  } = useModal(false, true);

  const {
    data: readNotificationsData,
    hasNextPage: hasNextPageRead,
    isFetchingNextPage: isFetchingNextPageRead,
    fetchNextPage: fetchNextPageRead
  } = useInfiniteQuery({
    queryKey: notificationKeys.infiniteReadNotifications(),
    queryFn: () => getInfiniteReadNotifications(),
    getNextPageParam: (lastPage) => {
      return lastPage.hasNext ? lastPage.notifications.length : undefined;
    },
    enabled: !!user,
    initialPageParam: 0,
    initialData: {
      pages: [
        {
          hasNext: false,
          notifications: []
        }
      ],
      pageParams: [0]
    }
  });

  const {
    data: unreadNotificationsData,
    hasNextPage: hasNextPageUnread,
    isFetchingNextPage: isFetchingNextPageUnread,
    fetchNextPage: fetchNextPageUnread
  } = useInfiniteQuery({
    queryKey: notificationKeys.infiniteUnreadNotifications(),
    queryFn: () => getInfiniteUnreadNotifications(),
    getNextPageParam: (lastPage) => {
      return lastPage.hasNext ? lastPage.notifications.length : undefined;
    },
    enabled: !!user,
    initialPageParam: 0,
    initialData: {
      pages: [
        {
          hasNext: false,
          notifications: []
        }
      ],
      pageParams: [0]
    }
  });

  const router = useRouter();

  // 데이터를 사용할 때 평면화
  const readNotifications =
    readNotificationsData?.pages.flatMap((page) => page.notifications) ?? [];
  const unreadNotifications =
    unreadNotificationsData?.pages.flatMap((page) => page.notifications) ?? [];

  const handleToggleNotificationPanel = () => {
    if (!user) {
      router.push({
        pathname: "/login",
        query: {
          redirectTo: router.asPath
        }
      });
    } else {
      toggleNotificationPanel();
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleToggleNotificationPanel();
    }
  };

  return (
    <div className="relative" ref={notificationPanelRef}>
      <Button
        role="button"
        variant={"text"}
        size="small"
        onClick={handleToggleNotificationPanel}
        onKeyDown={handleKeyDown}
        aria-label="알림 패널 열기"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        tabIndex={0}
      >
        <Bell />
      </Button>
      {isOpen && (
        <NotificationPanel
          readNotifications={readNotifications}
          unreadNotifications={unreadNotifications}
          hasNextPageRead={hasNextPageRead}
          hasNextPageUnread={hasNextPageUnread}
          isFetchingNextPageRead={isFetchingNextPageRead}
          isFetchingNextPageUnread={isFetchingNextPageUnread}
          fetchNextPageRead={fetchNextPageRead}
          fetchNextPageUnread={fetchNextPageUnread}
        />
      )}
    </div>
  );
};

export default NotificationPanelIcon;
