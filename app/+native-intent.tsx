import { resolveHrefFromDeepLinkUrl } from "@/src/lib/pushNavigation";

/**
 * Android 알림 탭 시 MainActivity가 설정하는 `zigtruckapp://push?url=...` 를
 * Expo Router가 처리하기 전에 실제 앱 경로로 변환한다.
 * (미변환 시 /push unmatched route 가 스택에 쌓여 뒤로가기 시 404 화면 노출)
 */
export function redirectSystemPath({
  path,
  initial,
}: {
  path: string;
  initial: boolean;
}): string {
  try {
    const isPushDeepLink = path.startsWith("zigtruckapp://push");

    // push 딥링크는 JS bootstrap(ZigtruckPushLaunchStore)에서만 처리
    if (isPushDeepLink) {
      return "";
    }

    const href = resolveHrefFromDeepLinkUrl(path);
    if (href) {
      return String(href);
    }
    return path;
  } catch {
    return initial ? "/(tabs)" : "";
  }
}
