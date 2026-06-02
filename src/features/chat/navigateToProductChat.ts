import { router } from "expo-router";
import apiManager from "@/src/api/AxiosInstance";
import { showAppAlert } from "@/src/providers/appDialog";
import {
  extractChatRoomId,
  normalizeChatRoomDetail,
} from "@/src/features/chat/utils";
import { setPendingChatRoom } from "@/src/features/chat/pendingChatRoom";

export async function navigateToProductChat(productId: number) {
  const response = await apiManager.post("/api/v1/chat-rooms", { productId });
  const room = normalizeChatRoomDetail(response.data);
  const chatRoomId = extractChatRoomId(room);

  if (chatRoomId) {
    router.push(`/chat/room/${chatRoomId}`);
    return;
  }

  if (!room.productId) {
    room.productId = productId;
  }

  setPendingChatRoom(room);
  router.push("/chat/room/draft");
}

export async function navigateToProductChatSafely(productId: number) {
  try {
    await navigateToProductChat(productId);
  } catch {
    showAppAlert({ title: "오류", message: "채팅방을 만들 수 없습니다. 잠시 후 다시 시도해주세요." });
  }
}
