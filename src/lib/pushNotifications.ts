import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { AppState, Platform } from "react-native";

import type { ChatSocketMessage } from "@/src/features/chat/types";
import { getChatMessageText } from "@/src/features/chat/utils";
import { displayAndroidNotification } from "@/src/lib/zigtruckNotifications";

const DEVICE_TOKEN_STORAGE_KEY = "fcm-device-token-v1";

type NotificationsModule = typeof import("expo-notifications");

let notificationsModulePromise: Promise<NotificationsModule | null> | null = null;
let firebaseMessagingApiPromise: Promise<{
  messaging: import("@react-native-firebase/messaging").Messaging;
  getToken: typeof import("@react-native-firebase/messaging").getToken;
  onTokenRefresh: typeof import("@react-native-firebase/messaging").onTokenRefresh;
}> | null = null;
let notificationHandlerConfigured = false;
let pushTokenListenerConfigured = false;
let onTokenRefreshCallback: ((token: string) => void) | null = null;
let lastKnownPushToken: string | null = null;

function isExpoGoClient() {
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

function logPushDebug(message: string, detail?: unknown) {
  if (__DEV__) {
    if (detail !== undefined) {
      console.log(`[push] ${message}`, detail);
    } else {
      console.log(`[push] ${message}`);
    }
  }
}

async function loadNotificationsModule(): Promise<NotificationsModule | null> {
  if (Platform.OS === "web" || isExpoGoClient()) {
    return null;
  }

  if (!notificationsModulePromise) {
    notificationsModulePromise = import("expo-notifications")
      .then((Notifications) => {
        if (!notificationHandlerConfigured) {
          Notifications.setNotificationHandler({
            handleNotification: async () => ({
              shouldShowAlert: true,
              shouldPlaySound: true,
              shouldSetBadge: true,
              shouldShowBanner: true,
              shouldShowList: true,
            }),
          });
          notificationHandlerConfigured = true;
        }
        return Notifications;
      })
      .catch((error) => {
        logPushDebug("expo-notifications load failed", error);
        return null;
      });
  }

  return notificationsModulePromise;
}

async function loadFirebaseMessagingApi() {
  if (!firebaseMessagingApiPromise) {
    firebaseMessagingApiPromise = import("@react-native-firebase/messaging").then(
      ({ getMessaging, getToken, onTokenRefresh }) => ({
        messaging: getMessaging(),
        getToken,
        onTokenRefresh,
      }),
    );
  }
  return firebaseMessagingApiPromise;
}

export async function getStoredDeviceToken() {
  return AsyncStorage.getItem(DEVICE_TOKEN_STORAGE_KEY);
}

export async function clearStoredDeviceToken() {
  await AsyncStorage.removeItem(DEVICE_TOKEN_STORAGE_KEY);
}

async function ensureAndroidChannels(Notifications: NotificationsModule) {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync("default", {
    name: "기본 알림",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#397AFF",
    sound: "default",
    enableVibrate: true,
    showBadge: true,
  });
}

async function requestNotificationPermission(
  Notifications: NotificationsModule,
  options?: { skipPrompt?: boolean },
): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === "granted") {
    return true;
  }
  if (options?.skipPrompt) {
    return false;
  }
  const { status } = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true },
  });
  return status === "granted";
}

/** FCM 디바이스 토큰 (expo-notifications → Google FCM) */
async function resolveFcmToken(): Promise<string | null> {
  try {
    const { messaging, getToken } = await loadFirebaseMessagingApi();
    const token = (await getToken(messaging))?.trim() ?? null;
    if (token) {
      lastKnownPushToken = token;
      logPushDebug("FCM token (firebase)", token.slice(0, 16) + "…");
      return token;
    }
  } catch (error) {
    logPushDebug("firebase getToken failed", error);
  }

  const Notifications = await loadNotificationsModule();
  if (!Notifications) {
    return null;
  }

  try {
    const tokenResponse = await Notifications.getDevicePushTokenAsync();
    const token = tokenResponse.data?.trim() ?? null;
    if (token) {
      lastKnownPushToken = token;
      logPushDebug("FCM token", token.slice(0, 16) + "…");
    }
    return token;
  } catch (error) {
    logPushDebug("getDevicePushTokenAsync failed", error);
    return null;
  }
}

export type PushRegistrationResult = {
  token: string | null;
  permissionGranted: boolean;
  error?: string;
};

export type RegisterPushOptions = {
  /** true 면 OS 권한 다이얼로그를 띄우지 않고 이미 허용된 경우에만 토큰을 발급한다. */
  skipPermissionPrompt?: boolean;
};

export async function registerForPushNotificationsAsync(
  options?: RegisterPushOptions,
): Promise<PushRegistrationResult> {
  if (Platform.OS === "web" || isExpoGoClient()) {
    return {
      token: null,
      permissionGranted: false,
      error: "Expo Go에서는 푸시를 사용할 수 없습니다. 개발 빌드를 설치해 주세요.",
    };
  }

  const Notifications = await loadNotificationsModule();
  if (!Notifications) {
    return {
      token: null,
      permissionGranted: false,
      error: "알림 모듈을 불러오지 못했습니다.",
    };
  }

  try {
    await ensureAndroidChannels(Notifications);
  } catch (error) {
    logPushDebug("channel setup failed", error);
  }

  const permissionGranted = await requestNotificationPermission(Notifications, {
    skipPrompt: options?.skipPermissionPrompt,
  });
  if (!permissionGranted) {
    return {
      token: null,
      permissionGranted: false,
      error: "알림 권한이 허용되지 않았습니다.",
    };
  }

  const token = await resolveFcmToken();
  if (token) {
    await AsyncStorage.setItem(DEVICE_TOKEN_STORAGE_KEY, token);
  }

  return {
    token,
    permissionGranted: true,
    error: token ? undefined : "FCM 토큰을 가져오지 못했습니다.",
  };
}

/** FCM 토큰 변경 시 서버 재등록 */
export async function setupPushTokenRefreshListener(
  onRefresh?: (token: string) => void,
): Promise<() => void> {
  onTokenRefreshCallback = onRefresh ?? null;

  const Notifications = await loadNotificationsModule();
  if (!Notifications) {
    return () => undefined;
  }

  if (pushTokenListenerConfigured) {
    return () => undefined;
  }

  pushTokenListenerConfigured = true;

  const subscription = Notifications.addPushTokenListener(({ data }) => {
    const token = data?.trim();
    if (!token) return;
    if (token === lastKnownPushToken) {
      return;
    }
    lastKnownPushToken = token;
    void AsyncStorage.setItem(DEVICE_TOKEN_STORAGE_KEY, token);
    logPushDebug("push token refreshed");
    onTokenRefreshCallback?.(token);
  });

  let unsubscribeFirebase: (() => void) | undefined;
  void loadFirebaseMessagingApi()
    .then(({ messaging, onTokenRefresh }) => {
      unsubscribeFirebase = onTokenRefresh(messaging, (nextToken) => {
        const token = nextToken?.trim();
        if (!token) return;
        if (token === lastKnownPushToken) {
          return;
        }
        lastKnownPushToken = token;
        void AsyncStorage.setItem(DEVICE_TOKEN_STORAGE_KEY, token);
        logPushDebug("firebase push token refreshed");
        onTokenRefreshCallback?.(token);
      });
    })
    .catch(() => undefined);

  return () => {
    subscription.remove();
    unsubscribeFirebase?.();
    pushTokenListenerConfigured = false;
    onTokenRefreshCallback = null;
  };
}

async function presentForegroundPushNotification(
  title: string | undefined,
  body: string | undefined,
  data: Record<string, unknown> | undefined,
) {
  const Notifications = await loadNotificationsModule();
  if (!Notifications) return;

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") return;

  const url =
    (typeof data?.url === "string" && data.url) ||
    (typeof data?.link === "string" && data.link) ||
    (typeof data?.redirectUrl === "string" && data.redirectUrl) ||
    "";

  const titleText = title?.trim() || "직트럭";
  const bodyText = body?.trim() || "새 알림이 도착했습니다.";

  if (
    displayAndroidNotification(titleText, bodyText, {
      ...data,
      url,
    })
  ) {
    return;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: titleText,
        body: bodyText,
        sound: "default",
        data: {
          ...data,
          url,
        },
      },
      trigger: null,
    });
  } catch (error) {
    logPushDebug("foreground local notification failed", error);
  }
}

/**
 * 웹소켓으로 채팅이 왔을 때 로컬 알림 (앱이 켜져 있을 때 FCM 없이도 표시)
 */
export async function showChatMessageLocalNotification(
  message: ChatSocketMessage,
  options?: { chattingEnabled?: boolean },
) {
  if (options?.chattingEnabled === false) {
    return;
  }

  const Notifications = await loadNotificationsModule();
  if (!Notifications) {
    return;
  }

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    return;
  }

  const title = message.memberName?.trim() || "새 채팅";
  const preview = getChatMessageText(message.contents);
  const body = preview || "새 메시지가 도착했습니다.";
  const chatRoomId = Number(message.chatRoomId);
  const url =
    Number.isFinite(chatRoomId) && chatRoomId > 0
      ? `https://www.zigtruck.io/chatting/room/${chatRoomId}`
      : "";

  if (
    displayAndroidNotification(title, body, {
      url,
      title,
      message: body,
      chatRoomId: String(chatRoomId),
    })
  ) {
    logPushDebug("local chat notification (native)", { title, body });
    return;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: "default",
        data: {
          url,
          title,
          message: body,
          chatRoomId: String(chatRoomId),
        },
      },
      trigger: null,
    });
    logPushDebug("local chat notification", { title, body });
  } catch (error) {
    logPushDebug("local notification failed", error);
  }
}

export type NotificationResponseListener = (
  response: import("expo-notifications").NotificationResponse | null,
) => void;

/** FCM 알림 탭(백그라운드/종료) */
export async function setupFirebaseMessagingHandlers(options: {
  /** 앱이 백그라운드일 때 알림 탭 */
  onNotificationOpen: (data: Record<string, unknown> | undefined) => void;
  /** 종료 상태에서 알림 탭으로 실행 */
  onColdStartNotification?: (data: Record<string, unknown> | undefined) => void;
}): Promise<() => void> {
  if (Platform.OS === "web" || isExpoGoClient()) {
    return () => undefined;
  }

  try {
    const { messaging, getToken } = await loadFirebaseMessagingApi();
    const {
      onMessage,
      onNotificationOpenedApp,
      getInitialNotification,
      setBackgroundMessageHandler,
    } = await import("@react-native-firebase/messaging");

    setBackgroundMessageHandler(messaging, async () => {
      // notification 페이로드는 OS가 표시
    });

    const unsubscribeOpened = onNotificationOpenedApp(messaging, (remoteMessage) => {
      logPushDebug("notification opened (firebase)", remoteMessage?.data);
      options.onNotificationOpen(
        remoteMessage?.data as Record<string, unknown> | undefined,
      );
    });

    void getInitialNotification(messaging).then((remoteMessage) => {
      if (!remoteMessage) return;
      logPushDebug("initial notification (firebase)", remoteMessage?.data);
      const handler = options.onColdStartNotification ?? options.onNotificationOpen;
      handler(remoteMessage?.data as Record<string, unknown> | undefined);
    });

    const unsubscribeMessage = onMessage(messaging, (remoteMessage) => {
      logPushDebug("foreground message (firebase)", remoteMessage?.data);
      // Android: ZigtruckFirebaseMessagingService 가 알림 표시(탭→앱 실행). iOS 등만 로컬 알림.
      if (Platform.OS !== "android") {
        void presentForegroundPushNotification(
          remoteMessage?.notification?.title,
          remoteMessage?.notification?.body,
          remoteMessage?.data as Record<string, unknown> | undefined,
        );
      }
    });

    void getToken(messaging).catch(() => undefined);

    return () => {
      unsubscribeOpened();
      unsubscribeMessage();
    };
  } catch (error) {
    logPushDebug("setupFirebaseMessagingHandlers failed", error);
    return () => undefined;
  }
}

export async function subscribeToNotificationResponses(
  listener: NotificationResponseListener,
): Promise<() => void> {
  const Notifications = await loadNotificationsModule();
  if (!Notifications) {
    return () => undefined;
  }

  const subscription =
    Notifications.addNotificationResponseReceivedListener(listener);

  if (Platform.OS !== "android") {
    try {
      const lastResponse = await Notifications.getLastNotificationResponseAsync();
      const data = lastResponse?.notification.request.content.data as
        | Record<string, unknown>
        | undefined;
      if (lastResponse && data && Object.keys(data).length > 0) {
        listener(lastResponse);
      }
    } catch {
      // ignore
    }
  }

  return () => subscription.remove();
}

export {
  extractPathFromNotification,
  mapWebPathToAppRoute,
  resolveRouteFromPushDeepLink,
} from "@/src/lib/pushNotificationRouting";
