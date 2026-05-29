import type { ChatRoomDetail } from "@/src/features/chat/types";

let pendingChatRoom: ChatRoomDetail | null = null;

export function setPendingChatRoom(room: ChatRoomDetail | null) {
  pendingChatRoom = room;
}

export function takePendingChatRoom(): ChatRoomDetail | null {
  const room = pendingChatRoom;
  pendingChatRoom = null;
  return room;
}
