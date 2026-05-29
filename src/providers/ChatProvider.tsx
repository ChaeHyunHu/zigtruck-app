import type { Client } from "@stomp/stompjs";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";

import { fetchChatRoomList } from "@/src/api/chat/getChat";
import {
  cleanupStaleChatRoomOnlineState,
  connectMemberChatSocket,
  reconnectStompClient,
  type ChatSocketPayload,
} from "@/src/features/chat/chatWebSocket";
import type { ChatListItem, ChatSocketMessage } from "@/src/features/chat/types";
import {
  applyChatSocketMessage,
  buildUnreadMap,
  normalizeChatListItems,
  sortChatListItems,
} from "@/src/features/chat/utils";
import { showChatMessageLocalNotification } from "@/src/lib/pushNotifications";
import { useAuth } from "@/src/hooks/useAuth";

type RoomMessageListener = (message: ChatSocketMessage) => void;
type MemberSocketListener = (payload: ChatSocketPayload) => void;

type ChatContextValue = {
  items: ChatListItem[];
  unreadByRoom: Record<number, number>;
  totalUnread: number;
  isLoading: boolean;
  refreshList: (options?: { silent?: boolean }) => Promise<void>;
  clearUnread: (chatRoomId: number) => void;
  setActiveChatRoomId: (chatRoomId: number | null) => void;
  getUnreadCount: (chatRoomId: number) => number;
  subscribeRoomMessages: (
    chatRoomId: number,
    listener: RoomMessageListener,
  ) => () => void;
  subscribeMemberSocketEvents: (listener: MemberSocketListener) => () => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

const LIST_POLL_MS = 10000;

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, memberId, profile } = useAuth();
  const chattingPushEnabled = profile?.notificationSettings?.chatting ?? true;
  const chattingPushEnabledRef = useRef(chattingPushEnabled);
  chattingPushEnabledRef.current = chattingPushEnabled;

  const [items, setItems] = useState<ChatListItem[]>([]);
  const [unreadByRoom, setUnreadByRoom] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const activeChatRoomIdRef = useRef<number | null>(null);
  const stompRef = useRef<Client | null>(null);
  const cleanedMemberRef = useRef<number | null>(null);
  const lastCleanupAtRef = useRef(0);
  const roomListenersRef = useRef<Map<number, Set<RoomMessageListener>>>(new Map());
  const memberSocketListenersRef = useRef<Set<MemberSocketListener>>(new Set());

  const totalUnread = useMemo(
    () => Object.values(unreadByRoom).reduce((sum, count) => sum + count, 0),
    [unreadByRoom],
  );

  const notifyRoomListeners = useCallback((message: ChatSocketMessage) => {
    const listeners = roomListenersRef.current.get(message.chatRoomId);
    listeners?.forEach((listener) => listener(message));
  }, []);

  const subscribeRoomMessages = useCallback(
    (chatRoomId: number, listener: RoomMessageListener) => {
      const roomId = Number(chatRoomId);
      if (!roomListenersRef.current.has(roomId)) {
        roomListenersRef.current.set(roomId, new Set());
      }
      roomListenersRef.current.get(roomId)!.add(listener);

      return () => {
        roomListenersRef.current.get(roomId)?.delete(listener);
      };
    },
    [],
  );

  const subscribeMemberSocketEvents = useCallback((listener: MemberSocketListener) => {
    memberSocketListenersRef.current.add(listener);
    return () => {
      memberSocketListenersRef.current.delete(listener);
    };
  }, []);

  const notifyMemberSocketListeners = useCallback((payload: ChatSocketPayload) => {
    memberSocketListenersRef.current.forEach((listener) => listener(payload));
  }, []);

  const refreshList = useCallback(async (options?: { silent?: boolean }) => {
    if (!isAuthenticated) {
      setItems([]);
      setUnreadByRoom({});
      return;
    }

    if (!options?.silent) {
      setIsLoading(true);
    }

    try {
      const list = sortChatListItems(normalizeChatListItems(await fetchChatRoomList()));
      setItems(list);
      setUnreadByRoom((prev) => {
        const fromApi = buildUnreadMap(list);
        const activeId = activeChatRoomIdRef.current;
        if (activeId == null) return fromApi;
        return { ...fromApi, [activeId]: 0 };
      });
    } catch {
      if (!options?.silent) {
        setItems([]);
        setUnreadByRoom({});
      }
    } finally {
      if (!options?.silent) {
        setIsLoading(false);
      }
    }
  }, [isAuthenticated]);

  const clearUnread = useCallback((chatRoomId: number) => {
    setUnreadByRoom((prev) => ({ ...prev, [chatRoomId]: 0 }));
    setItems((prev) =>
      prev.map((item) =>
        item.chatRoomId === chatRoomId ? { ...item, notReadChatMessageCount: 0 } : item,
      ),
    );
  }, []);

  const setActiveChatRoomId = useCallback(
    (chatRoomId: number | null) => {
      activeChatRoomIdRef.current = chatRoomId;
      if (chatRoomId != null) {
        clearUnread(chatRoomId);
      }
    },
    [clearUnread],
  );

  const getUnreadCount = useCallback(
    (chatRoomId: number) => unreadByRoom[chatRoomId] ?? 0,
    [unreadByRoom],
  );

  const handleSocketEvent = useCallback(
    (payload: ChatSocketPayload) => {
      if (payload.changeType !== "NEW_CHAT_MESSAGES") {
        notifyMemberSocketListeners(payload);
        return;
      }
      if (!payload.data) return;

      const data = payload.data;
      setItems((prev) => applyChatSocketMessage(prev, data));

      if (activeChatRoomIdRef.current === data.chatRoomId) {
        notifyRoomListeners(data);
        return;
      }

      setUnreadByRoom((prev) => ({
        ...prev,
        [data.chatRoomId]: (prev[data.chatRoomId] ?? 0) + 1,
      }));

      void showChatMessageLocalNotification(data, {
        chattingEnabled: chattingPushEnabledRef.current,
      });
    },
    [notifyMemberSocketListeners, notifyRoomListeners],
  );

  const handleSocketEventRef = useRef(handleSocketEvent);
  handleSocketEventRef.current = handleSocketEvent;

  const connectMemberSocket = useCallback(() => {
    if (!isAuthenticated || memberId == null) {
      return;
    }

    stompRef.current?.deactivate();
    const client = connectMemberChatSocket(memberId, (payload) => {
      handleSocketEventRef.current(payload);
    });
    stompRef.current = client;
  }, [isAuthenticated, memberId]);

  const runStaleOnlineCleanup = useCallback(async () => {
    if (!isAuthenticated || memberId == null) return;
    const now = Date.now();
    if (now - lastCleanupAtRef.current < 10_000) {
      return;
    }
    lastCleanupAtRef.current = now;
    try {
      const list = normalizeChatListItems(await fetchChatRoomList());
      await cleanupStaleChatRoomOnlineState(
        memberId,
        list.map((item) => item.chatRoomId),
      );
      if (__DEV__) {
        console.log("[chat] stale online cleanup done", list.length);
      }
    } catch {
      // ignore cleanup errors
    }
  }, [isAuthenticated, memberId]);

  useEffect(() => {
    if (!isAuthenticated || memberId == null) {
      stompRef.current?.deactivate();
      stompRef.current = null;
      cleanedMemberRef.current = null;
      return;
    }

    void refreshList();
    connectMemberSocket();
    if (cleanedMemberRef.current !== memberId) {
      cleanedMemberRef.current = memberId;
      void runStaleOnlineCleanup();
    }

    return () => {
      stompRef.current?.deactivate();
      stompRef.current = null;
    };
  }, [isAuthenticated, memberId, refreshList, connectMemberSocket, runStaleOnlineCleanup]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const onAppStateChange = (state: string) => {
      const client = stompRef.current;

      if (state !== "active") {
        if (client?.active || client?.connected) {
          void client.deactivate();
        }
        return;
      }

      void refreshList({ silent: true });
      void runStaleOnlineCleanup();
      if (client) {
        void reconnectStompClient(client);
      } else {
        connectMemberSocket();
      }
    };

    const subscription = AppState.addEventListener("change", onAppStateChange);
    const pollTimer = setInterval(() => {
      if (AppState.currentState === "active") {
        void refreshList({ silent: true });
        const client = stompRef.current;
        if (client && !client.connected) {
          void reconnectStompClient(client);
        }
      }
    }, LIST_POLL_MS);

    return () => {
      subscription.remove();
      clearInterval(pollTimer);
    };
  }, [isAuthenticated, refreshList, connectMemberSocket, runStaleOnlineCleanup]);

  const value = useMemo<ChatContextValue>(
    () => ({
      items,
      unreadByRoom,
      totalUnread,
      isLoading,
      refreshList,
      clearUnread,
      setActiveChatRoomId,
      getUnreadCount,
      subscribeRoomMessages,
      subscribeMemberSocketEvents,
    }),
    [
      items,
      unreadByRoom,
      totalUnread,
      isLoading,
      refreshList,
      clearUnread,
      setActiveChatRoomId,
      getUnreadCount,
      subscribeRoomMessages,
      subscribeMemberSocketEvents,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
}
