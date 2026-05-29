import type { Href } from "expo-router";

import { resolveNotificationRoute } from "@/src/features/notifications/utils";
import {
  extractPathFromNotification,
  mapWebPathToAppRoute,
  resolveRouteFromPushDeepLink,
} from "@/src/lib/pushNotificationRouting";

let pendingPushHref: Href | null = null;

export function setPendingPushRoute(href: Href) {
  pendingPushHref = href;
}

export function consumePendingPushRoute(): Href | null {
  const href = pendingPushHref;
  pendingPushHref = null;
  return href;
}

export function resolveHrefFromPushData(
  data: Record<string, unknown> | undefined,
): Href | null {
  if (!data) return null;

  const urlFields = [data.url, data.link, data.redirectUrl];
  for (const field of urlFields) {
    if (typeof field === "string" && field.trim()) {
      const route = resolveNotificationRoute(field.trim());
      if (route) return route;
    }
  }

  const chatRoomId =
    data.chatRoomId ??
    data.chat_room_id ??
    data.chatroomId ??
    data.chat_roomId ??
    data.roomId ??
    data.room_id ??
    data.chatId ??
    data.chat_id ??
    data.targetId;
  if (chatRoomId != null && String(chatRoomId).trim()) {
    return `/chat/room/${String(chatRoomId).trim()}` as Href;
  }

  const productId = data.productId ?? data.product_id;
  if (productId != null && String(productId).trim()) {
    return `/product/${String(productId).trim()}` as Href;
  }

  const path = extractPathFromNotification(data);
  if (path) {
    const route = mapWebPathToAppRoute(path);
    return route ? (route as Href) : null;
  }

  return null;
}

export function resolveHrefFromDeepLinkUrl(url: string | null | undefined): Href | null {
  if (!url) return null;

  const deepLinkRoute = resolveRouteFromPushDeepLink(url);
  if (deepLinkRoute) {
    return deepLinkRoute as Href;
  }

  return resolveNotificationRoute(url);
}
