import type { Href } from "expo-router";
import { Linking } from "react-native";

import {
  mapWebPathToAppRoute,
} from "@/src/lib/pushNotificationRouting";

export function calculateTimeAgo(dateTime: string | null | undefined): string {
  if (!dateTime) return "";
  const now = new Date();
  const diffInMilliseconds = now.getTime() - new Date(dateTime).getTime();
  const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInSeconds < 60) return "방금 전";
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
  if (diffInHours < 24) return `${diffInHours}시간 전`;
  if (diffInDays < 7) return `${diffInDays}일 전`;
  if (diffInWeeks < 5) return `${diffInWeeks}주 전`;
  if (diffInMonths < 12) return `${diffInMonths}개월 전`;
  return `${diffInYears}년 전`;
}

function resolvePathFromRedirect(redirectUrl: string): string | null {
  if (!redirectUrl) return null;
  if (redirectUrl.startsWith("http")) {
    try {
      const url = new URL(redirectUrl);
      const hash = url.hash?.replace(/^#/, "");
      const path = url.pathname || "/";
      if (hash) {
        return `${path}#${hash}`;
      }
      return path;
    } catch {
      return extractPathFromUrl(redirectUrl);
    }
  }
  return redirectUrl.startsWith("/") ? redirectUrl : `/${redirectUrl}`;
}

export function resolveNotificationRoute(redirectUrl: string | null | undefined): Href | null {
  if (!redirectUrl) return null;
  const path = resolvePathFromRedirect(redirectUrl);
  if (!path) return null;
  const route = mapWebPathToAppRoute(path);
  return route ? (route as Href) : null;
}

export async function openNotificationRedirect(
  redirectUrl: string | null | undefined,
  push: (href: Href) => void,
): Promise<void> {
  if (!redirectUrl) return;
  const route = resolveNotificationRoute(redirectUrl);
  if (route) {
    push(route);
    return;
  }
  if (redirectUrl.startsWith("/")) {
    const mapped = mapWebPathToAppRoute(redirectUrl);
    if (mapped) {
      push(mapped as Href);
      return;
    }
  }
  if (redirectUrl.startsWith("http")) {
    await Linking.openURL(redirectUrl);
  }
}

export function normalizeNotificationsResponse(raw: unknown): import("./types").NotificationsResponse {
  const data = raw as Record<string, unknown>;
  const activity = Array.isArray(data.activityNotifications)
    ? (data.activityNotifications as import("./types").MemberNotification[])
    : [];
  const interest = Array.isArray(data.interestProductNotifications)
    ? (data.interestProductNotifications as import("./types").MemberNotification[])
    : [];
  return {
    activityNotifications: activity,
    interestProductNotifications: interest,
    notReadActivityNotificationCount: Number(data.notReadActivityNotificationCount ?? 0),
    notReadInterestProductNotificationCount: Number(
      data.notReadInterestProductNotificationCount ?? 0,
    ),
  };
}
