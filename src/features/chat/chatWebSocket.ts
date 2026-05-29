import { Client, type IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";

import { getAccessToken } from "@/src/api/authStorage";

export type ChatSocketPayload = {
  changeType?: string;
  data?: {
    id?: number;
    chatRoomId: number;
    senderId?: number;
    memberName?: string;
    profileImageUrl?: string;
    frontSideImageUrl?: string;
    truckNumber?: string;
    contents?: string;
    createdDate?: string;
    type?: { code?: string };
  };
};

const STOMP_RECONNECT_DELAY_MS = 2000;
const STOMP_HEARTBEAT_MS = 10000;
const STOMP_CONNECTION_TIMEOUT_MS = 15000;
const STALE_ONLINE_CLEANUP_TIMEOUT_MS = 2500;

function getSockJsUrl() {
  const httpUrl = process.env.EXPO_PUBLIC_SERVER_URL ?? "";
  return `${httpUrl.replace(/\/$/, "")}/api/web-socket`;
}

function createStompClientOptions(
  overrides: ConstructorParameters<typeof Client>[0],
): ConstructorParameters<typeof Client>[0] {
  return {
    webSocketFactory: () => new SockJS(getSockJsUrl()) as unknown as WebSocket,
    reconnectDelay: STOMP_RECONNECT_DELAY_MS,
    heartbeatIncoming: STOMP_HEARTBEAT_MS,
    heartbeatOutgoing: STOMP_HEARTBEAT_MS,
    connectionTimeout: STOMP_CONNECTION_TIMEOUT_MS,
    ...overrides,
  };
}

/** 앱 복귀·소켓 끊김 시 STOMP 재연결 */
export async function reconnectStompClient(client: Client): Promise<void> {
  try {
    await client.deactivate();
  } catch {
    // ignore
  }
  client.activate();
}

type ChatRoomSocketOptions = {
  chatRoomId: number;
  memberId: number;
  onEvent: (payload: ChatSocketPayload) => void;
};

export function connectChatRoomSocket({
  chatRoomId,
  memberId,
  onEvent,
}: ChatRoomSocketOptions): Client {
  const client = new Client(
    createStompClientOptions({
      beforeConnect: async () => {
        const token = await getAccessToken();
        // 서버의 chat-room online 플래그는 강종 시 stale 될 수 있어 false read/push 누락을 유발한다.
        // CONNECT 헤더에 room metadata를 넣지 않아 온라인 오판을 막는다.
        client.connectHeaders = token ? { Authorization: `Bearer ${token}` } : {};
      },
      onConnect: () => {
        client.subscribe(`/sub/chat-room/${chatRoomId}`, (message: IMessage) => {
          try {
            onEvent(JSON.parse(message.body) as ChatSocketPayload);
          } catch {
            // ignore malformed payloads
          }
        });
      },
      onStompError: (frame) => {
        console.warn("[chat-room-socket] stomp error", frame.headers.message);
      },
      onWebSocketClose: () => {
        console.warn("[chat-room-socket] websocket closed, reconnecting");
      },
    }),
  );

  client.activate();
  return client;
}

export function disconnectChatRoomSocket(client: Client) {
  void client.deactivate();
}

async function disconnectStaleOnlineForRoom(
  memberId: number,
  chatRoomId: number,
): Promise<void> {
  const headers = {
    destination: `/sub/chat-room/${chatRoomId}`,
    memberId: String(memberId),
    chatRoomId: String(chatRoomId),
  };

  await new Promise<void>((resolve) => {
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    const client = new Client(
      createStompClientOptions({
        reconnectDelay: 0,
        connectHeaders: headers,
        disconnectHeaders: headers,
        beforeConnect: async () => {
          const token = await getAccessToken();
          client.connectHeaders = token
            ? { Authorization: `Bearer ${token}`, ...headers }
            : headers;
          client.disconnectHeaders = headers;
        },
        onConnect: () => {
          void client.deactivate().finally(done);
        },
        onStompError: () => {
          void client.deactivate().finally(done);
        },
        onWebSocketClose: () => {
          done();
        },
      }),
    );

    setTimeout(() => {
      void client.deactivate().finally(done);
    }, STALE_ONLINE_CLEANUP_TIMEOUT_MS);

    client.activate();
  });
}

/**
 * 프론트 전용 우회:
 * 앱 강종으로 서버 Redis online 키가 남아있는 경우, 채팅방별 DISCONNECT를 강제로 보내 stale 상태를 정리한다.
 */
export async function cleanupStaleChatRoomOnlineState(
  memberId: number,
  chatRoomIds: number[],
): Promise<void> {
  const uniqueRoomIds = Array.from(
    new Set(
      chatRoomIds
        .map((roomId) => Number(roomId))
        .filter((roomId) => Number.isFinite(roomId) && roomId > 0),
    ),
  );
  if (!uniqueRoomIds.length) return;

  for (const roomId of uniqueRoomIds) {
    await disconnectStaleOnlineForRoom(memberId, roomId);
  }
}

export function connectMemberChatSocket(
  memberId: number,
  onEvent: (payload: ChatSocketPayload) => void,
): Client {
  const client = new Client(
    createStompClientOptions({
      beforeConnect: async () => {
        const token = await getAccessToken();
        client.connectHeaders = token ? { Authorization: `Bearer ${token}` } : {};
      },
      onConnect: () => {
        client.subscribe(`/sub/members/${memberId}`, (message: IMessage) => {
          try {
            onEvent(JSON.parse(message.body) as ChatSocketPayload);
          } catch {
            // ignore malformed payloads
          }
        });
      },
      onStompError: (frame) => {
        if (__DEV__) {
          console.debug("[chat-socket] stomp error", frame.headers.message);
        }
      },
      onWebSocketError: () => {
        // 자동 재연결 — 끊김은 onWebSocketClose에서 처리
      },
      onWebSocketClose: () => {
        // 자동 재연결 — 정상 동작이므로 콘솔 경고 없음
      },
    }),
  );

  client.activate();
  return client;
}
