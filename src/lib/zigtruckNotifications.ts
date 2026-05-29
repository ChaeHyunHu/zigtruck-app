import { NativeModules, Platform } from "react-native";

type ZigtruckNotificationsNative = {
  display: (title: string, body: string, data: Record<string, unknown>) => void;
  consumeLaunchPushUrl: () => Promise<string | null>;
};

const NativeZigtruckNotifications =
  NativeModules.ZigtruckNotifications as ZigtruckNotificationsNative | undefined;

export function displayAndroidNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>,
): boolean {
  if (Platform.OS !== "android" || !NativeZigtruckNotifications?.display) {
    return false;
  }

  try {
    NativeZigtruckNotifications.display(title, body, data ?? {});
    return true;
  } catch {
    return false;
  }
}

/** 네이티브 알림 탭으로 저장된 딥링크 (Android) */
export async function consumeAndroidLaunchPushUrl(): Promise<string | null> {
  if (Platform.OS !== "android" || !NativeZigtruckNotifications?.consumeLaunchPushUrl) {
    return null;
  }

  try {
    const url = await NativeZigtruckNotifications.consumeLaunchPushUrl();
    return typeof url === "string" && url.trim() ? url.trim() : null;
  } catch {
    return null;
  }
}
