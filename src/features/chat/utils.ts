import {
  resolveOutgoingReadState,
  syncReadReceiptsFromConversation,
} from "@/src/features/chat/outgoingReadReceipts";
import { resolveImageUri } from "@/src/features/products/utils";

import type {
  ChatListItem,
  ChatMessageItem,
  ChatRoomDetail,
  ChatRoomMember,
  ChatSocketMessage,
} from "./types";
import type { ChatScenarioButton } from "./types";
import { toContractBool } from "@/src/features/contract/navigation";

import { CHAT_IMAGE, CHAT_SCENARIO, CHAT_TEXT } from "./chatMessageTypes";

export type ParsedChatContent = {
  text?: string;
  images?: string[];
  name?: string;
  buttons?: ChatScenarioButton[];
  type?: string;
};

export function parseChatMessageContents(contents?: unknown): ParsedChatContent {
  if (contents == null) return {};
  if (typeof contents === "object" && !Array.isArray(contents)) {
    return contents as ParsedChatContent;
  }
  if (typeof contents !== "string") {
    return { text: String(contents) };
  }

  const trimmed = contents.trim();
  if (!trimmed) return {};

  try {
    const parsed = JSON.parse(trimmed) as ParsedChatContent | string;
    if (typeof parsed === "string") {
      return parseChatMessageContents(parsed);
    }
    return parsed ?? {};
  } catch {
    return { text: contents };
  }
}

/** TEXT 메시지 표시용 — JSON/평문 모두 처리 */
export function getChatMessageText(contents?: unknown): string {
  const parsed = parseChatMessageContents(contents);
  if (typeof parsed.text === "string" && parsed.text.length > 0) {
    return parsed.text;
  }
  if (typeof contents === "string" && contents.trim()) {
    const trimmed = contents.trim();
    if (trimmed.startsWith("{") && trimmed.includes('"text"')) {
      try {
        const retry = JSON.parse(trimmed) as { text?: string };
        if (typeof retry.text === "string") return retry.text;
      } catch {
        // fall through
      }
    }
    if (!trimmed.startsWith("{")) {
      return contents;
    }
  }
  return "";
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

/** POST /chat-messages 응답이 data 래핑된 경우 펼침 */
export function unwrapChatMessageResponse<T extends object>(payload: unknown): T {
  const root = asRecord(payload);
  if (!root) return {} as T;
  const nested = asRecord(root.data);
  return (nested ?? root) as T;
}

export function resolveChatMessageSenderId(
  message: Record<string, unknown>,
): number | undefined {
  const sender = asRecord(message.sender);
  const candidates = [message.senderId, sender?.id, message.memberId];
  for (const value of candidates) {
    if (value !== undefined && value !== null && value !== "") {
      const id = Number(value);
      if (!Number.isNaN(id)) return id;
    }
  }
  return undefined;
}

/** 내 메시지의 isRead = 상대가 읽음. 상대 메시지에는 읽음 표시 없음. */
export function normalizeMessageReadState(
  message: ChatMessageItem,
  memberId?: number,
  roomId?: number,
): ChatMessageItem {
  if (memberId == null) return message;
  const isMine = Number(message.senderId) === Number(memberId);
  if (!isMine) {
    return { ...message, isRead: undefined };
  }
  return {
    ...message,
    isRead: resolveOutgoingReadState(message, memberId, roomId),
  };
}

export function withConversationReadState(
  messages: ChatMessageItem[],
  memberId?: number,
  roomId?: number,
): ChatMessageItem[] {
  if (memberId == null || roomId == null) return messages;
  syncReadReceiptsFromConversation(messages, memberId, roomId);
  return messages.map((msg) => normalizeMessageReadState(msg, memberId, roomId));
}

export function applyReadReceipts(
  messages: ChatMessageItem[],
  readMessageIds: number[],
  memberId?: number,
  roomId?: number,
): ChatMessageItem[] {
  if (!readMessageIds.length || memberId == null || roomId == null) {
    return messages;
  }

  const withReadFlags = messages.map((msg) => {
    if (Number(msg.senderId) !== Number(memberId)) {
      return normalizeMessageReadState(msg, memberId, roomId);
    }
    if (!readMessageIds.includes(msg.id)) {
      return normalizeMessageReadState(msg, memberId, roomId);
    }
    return {
      ...msg,
      isRead: resolveOutgoingReadState(
        { ...msg, isRead: true },
        memberId,
        roomId,
      ),
    };
  });

  return withConversationReadState(withReadFlags, memberId, roomId);
}

export function normalizeChatMessageItem(
  message: ChatMessageItem,
  options?: { senderId?: number; memberId?: number; roomId?: number },
): ChatMessageItem {
  const base = unwrapChatMessageResponse<ChatMessageItem>(message);
  const senderId =
    options?.senderId ??
    resolveChatMessageSenderId(base as unknown as Record<string, unknown>) ??
    base.senderId;

  const senderRaw = (base as ChatMessageItem & { sender?: unknown }).sender;
  let normalized: ChatMessageItem = {
    ...base,
    senderId: Number(senderId),
    sender: normalizeChatRoomMember(senderRaw) ?? base.sender,
  };

  const typeCode = normalized.type?.code ?? CHAT_TEXT;
  if (typeCode === CHAT_SCENARIO) {
    return normalizeMessageReadState(
      normalized,
      options?.memberId,
      options?.roomId,
    );
  }
  if (typeCode === CHAT_TEXT) {
    normalized = {
      ...normalized,
      contents: getChatMessageText(normalized.contents),
    };
  }
  return normalizeMessageReadState(
    normalized,
    options?.memberId,
    options?.roomId,
  );
}

export function renderMultilineText(text: string) {
  return text.split("\n");
}

export function normalizeChatRoomMember(raw: unknown): ChatRoomMember | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const member = raw as Record<string, unknown>;
  const id = member.id ?? member.memberId;
  const name = member.name ?? member.memberName;
  const profileImageUrl = resolveImageUri(
    member.profileImageUrl ??
      member.profileImageUri ??
      member.profileImage ??
      member.profile,
  );

  return {
    id: id != null && id !== "" ? Number(id) : undefined,
    name: typeof name === "string" ? name : undefined,
    profileImageUrl,
  };
}

export function normalizeChatRoomDetail(raw: unknown): ChatRoomDetail {
  const root = asRecord(raw);
  const data = (asRecord(root?.data) ?? root) as Record<string, unknown>;
  const room = data as unknown as ChatRoomDetail;
  const parsedId = Number(room.id ?? data.chatRoomId);
  const id =
    Number.isFinite(parsedId) && parsedId > 0 ? parsedId : undefined;

  return {
    ...room,
    id,
    buyer: normalizeChatRoomMember(room.buyer) ?? room.buyer,
    seller: normalizeChatRoomMember(room.seller) ?? room.seller,
    transferorCompleted: toContractBool(room.transferorCompleted),
    transfereeCompleted: toContractBool(room.transfereeCompleted),
  };
}

export function extractChatRoomId(
  room: ChatRoomDetail | Record<string, unknown> | null | undefined,
): number | undefined {
  if (!room) return undefined;
  const record = room as Record<string, unknown>;
  const parsed = Number(record.id ?? record.chatRoomId);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export function extractChatRoomIdFromMessageResponse(
  payload: unknown,
): number | undefined {
  const root = asRecord(payload);
  const data = asRecord(root?.data) ?? root;
  const chatRoom = asRecord(data?.chatRoom);
  if (chatRoom) {
    const fromRoom = extractChatRoomId(chatRoom);
    if (fromRoom) return fromRoom;
  }
  return extractChatRoomId(data ?? {});
}

export function getChatRecipient(
  room: ChatRoomDetail,
  memberId?: number,
): ChatRoomMember | undefined {
  if (memberId != null && Number(memberId) === Number(room.buyer?.id)) {
    return room.seller;
  }
  if (memberId != null && Number(memberId) === Number(room.seller?.id)) {
    return room.buyer;
  }
  return room.seller ?? room.buyer;
}

export function normalizeChatListItem(raw: unknown): ChatListItem {
  const item = (raw ?? {}) as Record<string, unknown>;
  return {
    chatRoomId: Number(item.chatRoomId),
    lastMessage: typeof item.lastMessage === "string" ? item.lastMessage : undefined,
    lastMessageTime:
      typeof item.lastMessageTime === "string" ? item.lastMessageTime : undefined,
    memberName: typeof item.memberName === "string" ? item.memberName : undefined,
    profileImageUrl: resolveImageUri(
      item.profileImageUrl ?? item.profileImageUri ?? item.profileImage,
    ),
    productRepresentImageUrl: resolveImageUri(
      item.productRepresentImageUrl ??
        item.frontSideImageUrl ??
        item.representImageUrl,
    ),
    truckNumber: typeof item.truckNumber === "string" ? item.truckNumber : undefined,
    truckName: typeof item.truckName === "string" ? item.truckName : undefined,
    productId: item.productId != null ? Number(item.productId) : undefined,
    price: item.price != null ? Number(item.price) : undefined,
    notReadChatMessageCount:
      item.notReadChatMessageCount != null
        ? Number(item.notReadChatMessageCount)
        : undefined,
  };
}

export function normalizeChatListItems(payload: unknown): ChatListItem[] {
  if (Array.isArray(payload)) {
    return payload.map((item) => normalizeChatListItem(item));
  }
  const root = asRecord(payload);
  const candidates = [
    root?.content,
    root?.data,
    root?.items,
    asRecord(root?.data)?.content,
    asRecord(root?.data)?.items,
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.map((item) => normalizeChatListItem(item));
    }
  }
  return [];
}

export function sortChatListItems(items: ChatListItem[]): ChatListItem[] {
  return [...items].sort(
    (a, b) =>
      new Date(b.lastMessageTime ?? 0).getTime() -
      new Date(a.lastMessageTime ?? 0).getTime(),
  );
}

export function buildUnreadMap(items: ChatListItem[]): Record<number, number> {
  return items.reduce<Record<number, number>>((acc, item) => {
    acc[item.chatRoomId] = item.notReadChatMessageCount ?? 0;
    return acc;
  }, {});
}

export function applyChatSocketMessage(
  items: ChatListItem[],
  data: ChatSocketMessage,
): ChatListItem[] {
  const existingIndex = items.findIndex((item) => item.chatRoomId === data.chatRoomId);

  if (existingIndex !== -1) {
    const next = items.map((item, index) =>
      index === existingIndex
        ? {
            ...item,
            lastMessage: data.contents ?? item.lastMessage,
            lastMessageTime: data.createdDate ?? item.lastMessageTime,
            memberName: data.memberName ?? item.memberName,
            profileImageUrl:
              resolveImageUri(data.profileImageUrl) ?? item.profileImageUrl,
            productRepresentImageUrl:
              resolveImageUri(data.frontSideImageUrl) ?? item.productRepresentImageUrl,
            truckNumber: data.truckNumber ?? item.truckNumber,
          }
        : item,
    );
    return sortChatListItems(next);
  }

  const created: ChatListItem = {
    chatRoomId: data.chatRoomId,
    lastMessage: data.contents,
    lastMessageTime: data.createdDate,
    memberName: data.memberName,
    profileImageUrl: resolveImageUri(data.profileImageUrl),
    productRepresentImageUrl: resolveImageUri(data.frontSideImageUrl),
    truckNumber: data.truckNumber,
    notReadChatMessageCount: 0,
  };

  return sortChatListItems([...items, created]);
}

export function extractRecipientProfileFromMessages(
  messages: ChatMessageItem[] | undefined,
  recipientId?: number,
): string | undefined {
  if (!messages?.length || recipientId == null) return undefined;

  for (const message of messages) {
    if (Number(message.senderId) !== Number(recipientId)) continue;
    const sender = asRecord((message as ChatMessageItem & { sender?: unknown }).sender);
    const url = resolveImageUri(
      sender?.profileImageUrl ?? sender?.profileImageUri ?? sender?.profileImage ?? sender?.profile,
    );
    if (url) return url;
  }
  return undefined;
}

export function shouldShowOpponentProfile(item: ChatMessageItem, isMine: boolean): boolean {
  if (isMine) return false;
  const typeCode = item.type?.code ?? CHAT_TEXT;
  return typeCode === CHAT_TEXT || typeCode === CHAT_IMAGE;
}

export function enrichChatRecipientProfile(
  room: ChatRoomDetail,
  memberId: number | undefined,
  profileImageUrl?: string,
): ChatRoomDetail {
  const resolved = resolveImageUri(profileImageUrl);
  if (!resolved) return room;

  const isBuyer = Number(memberId) === Number(room.buyer?.id);
  if (isBuyer) {
    if (room.seller?.profileImageUrl) return room;
    return {
      ...room,
      seller: { ...room.seller, profileImageUrl: resolved },
    };
  }

  if (room.buyer?.profileImageUrl) return room;
  return {
    ...room,
    buyer: { ...room.buyer, profileImageUrl: resolved },
  };
}

export function socketPayloadToChatMessageItem(data: ChatSocketMessage): ChatMessageItem {
  return normalizeChatMessageItem({
    id: data.id ?? Date.now(),
    senderId: Number(data.senderId ?? 0),
    contents: data.contents ?? "",
    createdDate: data.createdDate ?? new Date().toISOString(),
    type: data.type ?? { code: CHAT_TEXT },
    isRead: false,
  });
}

export function mergeChatMessages(
  current: ChatMessageItem[],
  incoming: ChatMessageItem[],
  memberId?: number,
  roomId?: number,
): ChatMessageItem[] {
  const pending = current.filter((msg) => msg.tempId != null);
  const byId = new Map<number, ChatMessageItem>();

  for (const msg of incoming) {
    const normalized =
      memberId != null
        ? normalizeChatMessageItem(msg, { memberId, roomId })
        : msg;
    const existing = current.find((item) => item.id === normalized.id);
    if (
      existing &&
      memberId != null &&
      roomId != null &&
      Number(existing.senderId) === Number(memberId)
    ) {
      byId.set(normalized.id, {
        ...normalized,
        isRead: resolveOutgoingReadState(
          {
            ...normalized,
            isRead: normalized.isRead ?? existing.isRead,
          },
          memberId,
          roomId,
        ),
      });
    } else {
      byId.set(normalized.id, normalized);
    }
  }

  for (const msg of pending) {
    const replaced = incoming.find(
      (item) =>
        item.tempId === msg.tempId ||
        (getChatMessageText(item.contents) === getChatMessageText(msg.contents) &&
          Number(item.senderId) === Number(msg.senderId)),
    );
    if (!replaced) {
      byId.set(msg.id, msg);
    }
  }

  const merged = [...byId.values()].sort((a, b) => {
    const aTime = new Date(a.createdDate ?? 0).getTime();
    const bTime = new Date(b.createdDate ?? 0).getTime();
    return aTime - bTime;
  });

  return withConversationReadState(merged, memberId, roomId);
}

export function formatChatListPreview(lastMessage?: string) {
  if (!lastMessage) return "";
  const text = getChatMessageText(lastMessage);
  if (text) return text;
  const parsed = parseChatMessageContents(lastMessage);
  if (parsed.images?.length) return "사진을 보냈습니다.";
  return "";
}
