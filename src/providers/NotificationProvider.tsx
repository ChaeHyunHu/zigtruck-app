import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AppState } from "react-native";

import { getNotifications } from "@/src/api/public";
import type { ChatSocketPayload } from "@/src/features/chat/chatWebSocket";
import {
  ACTIVITY_NOTIFICATION_TYPES,
  INTEREST_PRODUCT_NOTIFICATION_TYPES,
} from "@/src/features/notifications/constants";
import type {
  MemberNotification,
  NotificationsResponse,
} from "@/src/features/notifications/types";
import { normalizeNotificationsResponse } from "@/src/features/notifications/utils";
import { showChatMessageLocalNotification } from "@/src/lib/pushNotifications";
import { useAuth } from "@/src/hooks/useAuth";
import { useChat } from "@/src/providers/ChatProvider";

type NotificationContextValue = {
  data: NotificationsResponse | null;
  isLoading: boolean;
  hasUnread: boolean;
  refresh: (options?: { silent?: boolean }) => Promise<void>;
  removeNotification: (id: number, tab: "activity" | "interest") => void;
  markTabRead: (tab: "activity" | "interest") => void;
  patchFromSocket: (
    changeType: string,
    memberNotification: MemberNotification,
  ) => void;
};

const emptyData: NotificationsResponse = {
  activityNotifications: [],
  interestProductNotifications: [],
  notReadActivityNotificationCount: 0,
  notReadInterestProductNotificationCount: 0,
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

function extractMemberNotification(payload: ChatSocketPayload): MemberNotification | null {
  const raw = payload.data as Record<string, unknown> | undefined;
  if (!raw) return null;
  const nested = raw.memberNotification as MemberNotification | undefined;
  if (nested?.notification) return nested;
  if (raw.notification) {
    return raw as unknown as MemberNotification;
  }
  return null;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { subscribeMemberSocketEvents } = useChat();
  const [data, setData] = useState<NotificationsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!isAuthenticated) {
        setData(null);
        return;
      }
      if (!options?.silent) {
        setIsLoading(true);
      }
      try {
        const res = await getNotifications();
        setData(normalizeNotificationsResponse(res.data));
      } catch {
        if (!options?.silent) {
          setData(emptyData);
        }
      } finally {
        if (!options?.silent) {
          setIsLoading(false);
        }
      }
    },
    [isAuthenticated],
  );

  const patchFromSocket = useCallback(
    (changeType: string, memberNotification: MemberNotification) => {
      setData((prev) => {
        const base = prev ?? emptyData;
        if (changeType === "ACTIVITY_NOTIFICATION") {
          return {
            ...base,
            activityNotifications: [memberNotification, ...base.activityNotifications],
            notReadActivityNotificationCount: base.notReadActivityNotificationCount + 1,
          };
        }
        if (changeType === "INTEREST_PRODUCT_NOTIFICATION") {
          return {
            ...base,
            interestProductNotifications: [
              memberNotification,
              ...base.interestProductNotifications,
            ],
            notReadInterestProductNotificationCount:
              base.notReadInterestProductNotificationCount + 1,
          };
        }
        return base;
      });
    },
    [],
  );

  const removeNotification = useCallback((id: number, tab: "activity" | "interest") => {
    setData((prev) => {
      if (!prev) return prev;
      if (tab === "activity") {
        const target = prev.activityNotifications.find((item) => item.id === id);
        const wasUnread = target && !target.isRead;
        return {
          ...prev,
          activityNotifications: prev.activityNotifications.filter((item) => item.id !== id),
          notReadActivityNotificationCount: wasUnread
            ? Math.max(0, prev.notReadActivityNotificationCount - 1)
            : prev.notReadActivityNotificationCount,
        };
      }
      const target = prev.interestProductNotifications.find((item) => item.id === id);
      const wasUnread = target && !target.isRead;
      return {
        ...prev,
        interestProductNotifications: prev.interestProductNotifications.filter(
          (item) => item.id !== id,
        ),
        notReadInterestProductNotificationCount: wasUnread
          ? Math.max(0, prev.notReadInterestProductNotificationCount - 1)
          : prev.notReadInterestProductNotificationCount,
      };
    });
  }, []);

  const markTabRead = useCallback((tab: "activity" | "interest") => {
    setData((prev) => {
      if (!prev) return prev;
      if (tab === "activity") {
        return {
          ...prev,
          activityNotifications: prev.activityNotifications.map((item) => ({
            ...item,
            isRead: true,
          })),
          notReadActivityNotificationCount: 0,
        };
      }
      return {
        ...prev,
        interestProductNotifications: prev.interestProductNotifications.map((item) => ({
          ...item,
          isRead: true,
        })),
        notReadInterestProductNotificationCount: 0,
      };
    });
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setData(null);
      return;
    }
    void refresh();
  }, [isAuthenticated, refresh]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void refresh({ silent: true });
      }
    });
    return () => sub.remove();
  }, [isAuthenticated, refresh]);

  useEffect(() => {
    if (!isAuthenticated) return;
    return subscribeMemberSocketEvents((payload) => {
      const changeType = payload.changeType;
      if (
        changeType !== "ACTIVITY_NOTIFICATION" &&
        changeType !== "INTEREST_PRODUCT_NOTIFICATION"
      ) {
        return;
      }
      const memberNotification = extractMemberNotification(payload);
      if (!memberNotification) return;

      patchFromSocket(changeType, memberNotification);

      const n = memberNotification.notification;
      void showChatMessageLocalNotification(
        {
          chatRoomId: 0,
          memberName: n.title,
          contents: n.contents,
        },
        { chattingEnabled: true },
      );
    });
  }, [isAuthenticated, patchFromSocket, subscribeMemberSocketEvents]);

  const hasUnread = useMemo(() => {
    if (!data) return false;
    return (
      data.notReadActivityNotificationCount > 0 ||
      data.notReadInterestProductNotificationCount > 0
    );
  }, [data]);

  const value = useMemo<NotificationContextValue>(
    () => ({
      data,
      isLoading,
      hasUnread,
      refresh,
      removeNotification,
      markTabRead,
      patchFromSocket,
    }),
    [
      data,
      hasUnread,
      isLoading,
      markTabRead,
      patchFromSocket,
      refresh,
      removeNotification,
    ],
  );

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}

export async function markNotificationsReadOnLeave(tab: "activity" | "interest") {
  const { updateMemberNotificationsMark } = await import(
    "@/src/api/notification/updateNotification"
  );
  const type =
    tab === "activity"
      ? ACTIVITY_NOTIFICATION_TYPES
      : INTEREST_PRODUCT_NOTIFICATION_TYPES;
  await updateMemberNotificationsMark(type);
}
