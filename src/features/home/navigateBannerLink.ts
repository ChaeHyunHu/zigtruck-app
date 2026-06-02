import type { Href } from "expo-router";
import { Linking } from "react-native";

import type { BannerItem } from "@/src/features/home/types";
import { resolveNotificationRoute } from "@/src/features/notifications/utils";
import { mapWebPathToAppRoute } from "@/src/lib/pushNotificationRouting";

export function navigateBannerLink(
  item: BannerItem,
  push: (href: Href) => void,
): void {
  const link = item.link?.trim();
  if (!link) return;

  if (item.type?.code === "INTERNAL") {
    const route =
      (link.startsWith("/") ? mapWebPathToAppRoute(link) : null) ?? link;
    push(route as Href);
    return;
  }

  const resolved = resolveNotificationRoute(link);
  if (resolved) {
    push(resolved);
    return;
  }

  if (link.startsWith("/")) {
    const mapped = mapWebPathToAppRoute(link);
    if (mapped) {
      push(mapped as Href);
    }
    return;
  }

  // 통으로 들어온 전체 URL(http/https)은 외부 브라우저로 이동
  if (/^https?:\/\//i.test(link)) {
    Linking.openURL(link).catch(() => undefined);
  }
}
