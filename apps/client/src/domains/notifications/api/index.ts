import axios from "axios";
import {
  BaseNotification,
  NotificationDetails,
  NotificationFactory
} from "@kokomen/types";

// eslint-disable-next-line @rushstack/typedef-var
const notificationInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_NOTIFICATION_API_BASE_URL}/notifications`,
  withCredentials: true
});

type InfiniteReadNotificationsResponse = {
  notifications: {
    notification_payload: NotificationDetails;
    created_at: string;
  }[];
  has_next: boolean;
};
export const getInfiniteReadNotifications = async (): Promise<{
  hasNext: boolean;
  notifications: BaseNotification[];
}> => {
  return notificationInstance
    .get<InfiniteReadNotificationsResponse>("/me/read", {
      params: {
        size: 10,
        sort: "id,desc"
      }
    })
    .then((res) => res.data)
    .then((data) => ({
      hasNext: data.has_next,
      notifications: data.notifications.map((item) =>
        NotificationFactory.create(
          item.notification_payload.notification_type,
          item.created_at,
          item.notification_payload,
          true
        )
      )
    }));
};

type InfiniteUnreadNotificationsResponse = {
  notifications: {
    notification_payload: NotificationDetails;
    created_at: string;
  }[];
  has_next: boolean;
};
export const getInfiniteUnreadNotifications = async (): Promise<{
  hasNext: boolean;
  notifications: BaseNotification[];
}> => {
  return notificationInstance
    .get<InfiniteUnreadNotificationsResponse>("/me/unread", {
      params: {
        size: 10,
        sort: "id,desc"
      }
    })
    .then((res) => res.data)
    .then((data) => ({
      hasNext: data.has_next,
      notifications: data.notifications.map((item) =>
        NotificationFactory.create(
          item.notification_payload.notification_type,
          item.created_at,
          item.notification_payload,
          false
        )
      )
    }));
};
