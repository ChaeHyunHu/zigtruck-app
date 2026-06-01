import type { Href } from "expo-router";
import { router } from "expo-router";

import { resolveNotificationRoute } from "@/src/features/notifications/utils";
import {
  extractPathFromNotification,
  mapWebPathToAppRoute,
  resolveRouteFromPushDeepLink,
} from "@/src/lib/pushNotificationRouting";

let pendingPushHref: Href | null = null;

const PUSH_NAV_DEDUP_MS = 4000;
let lastPushRouteKey: string | null = null;
let lastPushNavAt = 0;

export function normalizePushRouteKey(href: Href): string {
  return String(href).split("?")[0] ?? String(href);
}

export function shouldSkipDuplicatePushNavigation(href: Href): boolean {
  const key = normalizePushRouteKey(href);
  return (
    lastPushRouteKey === key && Date.now() - lastPushNavAt < PUSH_NAV_DEDUP_MS
  );
}

export function recordPushNavigation(href: Href) {
  lastPushRouteKey = normalizePushRouteKey(href);
  lastPushNavAt = Date.now();
}

export function setPendingPushRoute(href: Href) {
  const key = normalizePushRouteKey(href);
  if (pendingPushHref && normalizePushRouteKey(pendingPushHref) === key) {
    return;
  }
  pendingPushHref = href;
}

export function consumePendingPushRoute(): Href | null {
  const href = pendingPushHref;
  pendingPushHref = null;
  return href;
}

export function clearPendingPushRoute() {
  pendingPushHref = null;
}

type PushNavigateOptions = {
  /** 앱 cold start 직후 index → tabs 전환 전일 때만 true */
  coldStart?: boolean;
};

/**
 * 푸시 알림 탭으로 이동.
 * warm start 에서 router.replace('/(tabs)') 를 쓰면 홈이 스택에 중복 쌓이므로
 * 실행 중에는 dismissTo + push, cold start 만 replace 후 push.
 */
export function navigateFromPushNotification(
  href: Href,
  options?: PushNavigateOptions,
): boolean {
  if (shouldSkipDuplicatePushNavigation(href)) {
    clearPendingPushRoute();
    return false;
  }

  const path = String(href);
  recordPushNavigation(href);
  clearPendingPushRoute();

  try {
    if (path.startsWith("/(tabs)") || path === "/(tabs)") {
      router.replace(href);
      return true;
    }

    if (options?.coldStart) {
      router.replace("/(tabs)" as Href);
      setTimeout(() => {
        router.push(href);
      }, 50);
      return true;
    }

    if (router.canDismiss()) {
      router.dismissTo("/(tabs)" as Href);
    }
    router.push(href);
    return true;
  } catch {
    setPendingPushRoute(href);
    return false;
  }
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
