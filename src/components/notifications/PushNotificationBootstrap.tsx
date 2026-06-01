import type { Href } from "expo-router";
import React, { useCallback, useEffect, useRef } from "react";
import { AppState, DeviceEventEmitter, Platform } from "react-native";

import { useAuth } from "@/src/hooks/useAuth";
import {
  consumePendingPushRoute,
  navigateFromPushNotification,
  resolveHrefFromDeepLinkUrl,
  resolveHrefFromPushData,
  setPendingPushRoute,
} from "@/src/lib/pushNavigation";
import {
  setupFirebaseMessagingHandlers,
  setupPushTokenRefreshListener,
  subscribeToNotificationResponses,
} from "@/src/lib/pushNotifications";
import { consumeAndroidLaunchPushUrl } from "@/src/lib/zigtruckNotifications";

const ANDROID_PUSH_LAUNCH_EVENT = "ZigtruckPushLaunch";

function pushLog(...args: unknown[]) {
  if (__DEV__) {
    console.log("[push-nav]", ...args);
  }
}

function navigateFromStoredPushUrl(
  url: string | null,
  options?: { coldStart?: boolean },
): boolean {
  if (!url) return false;
  pushLog("navigateFromStoredPushUrl", url, options);
  const href = resolveHrefFromDeepLinkUrl(url);
  if (!href) return false;
  return navigateFromPushNotification(href, options);
}

export function PushNotificationBootstrap() {
  const { isInitializing, syncPushToken } = useAuth();
  const appReadyRef = useRef(false);
  const handlingPushRef = useRef(false);

  const handleAndroidNotificationLaunch = useCallback(
    async (options?: { coldStart?: boolean }): Promise<boolean> => {
      if (handlingPushRef.current) {
        return false;
      }

      const url = await consumeAndroidLaunchPushUrl();
      pushLog("consumeAndroidLaunchPushUrl", url);
      if (!url) return false;

      const href = resolveHrefFromDeepLinkUrl(url);
      if (!href) return false;

      if (!appReadyRef.current || isInitializing) {
        setPendingPushRoute(href);
        return false;
      }

      handlingPushRef.current = true;
      try {
        return navigateFromStoredPushUrl(url, options);
      } finally {
        setTimeout(() => {
          handlingPushRef.current = false;
        }, 500);
      }
    },
    [isInitializing],
  );

  const openFromPushData = useCallback(
    (data: Record<string, unknown> | undefined) => {
      pushLog("openFromPushData", data);
      const href = resolveHrefFromPushData(data);
      if (!href) return;

      if (Platform.OS === "android") {
        setPendingPushRoute(href);
        if (appReadyRef.current && !isInitializing) {
          void handleAndroidNotificationLaunch();
        }
        return;
      }

      if (!appReadyRef.current || isInitializing) {
        setPendingPushRoute(href);
        return;
      }

      navigateFromPushNotification(href);
    },
    [handleAndroidNotificationLaunch, isInitializing],
  );

  const runSyncPushToken = useCallback(() => {
    void syncPushToken();
  }, [syncPushToken]);

  useEffect(() => {
    runSyncPushToken();
  }, [runSyncPushToken]);

  useEffect(() => {
    let removeTokenListener: (() => void) | undefined;

    void setupPushTokenRefreshListener(() => {
      runSyncPushToken();
    }).then((unsubscribe) => {
      removeTokenListener = unsubscribe;
    });

    const appStateSub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        runSyncPushToken();
        void handleAndroidNotificationLaunch();
      }
    });

    const pushLaunchSub = DeviceEventEmitter.addListener(
      ANDROID_PUSH_LAUNCH_EVENT,
      () => {
        pushLog("ZigtruckPushLaunch event");
        void handleAndroidNotificationLaunch();
      },
    );

    return () => {
      removeTokenListener?.();
      appStateSub.remove();
      pushLaunchSub.remove();
    };
  }, [handleAndroidNotificationLaunch, runSyncPushToken]);

  useEffect(() => {
    let removeExpoListener: (() => void) | undefined;
    let removeFirebaseListener: (() => void) | undefined;

    void subscribeToNotificationResponses((response) => {
      if (Platform.OS === "android") {
        return;
      }
      const data = response?.notification.request.content.data as
        | Record<string, unknown>
        | undefined;
      openFromPushData(data);
    }).then((unsubscribe) => {
      removeExpoListener = unsubscribe;
    });

    void setupFirebaseMessagingHandlers({
      onNotificationOpen: openFromPushData,
      onColdStartNotification: (data) => {
        const href = resolveHrefFromPushData(data);
        if (href) {
          setPendingPushRoute(href);
        }
      },
    }).then((unsubscribe) => {
      removeFirebaseListener = unsubscribe;
    });

    return () => {
      removeExpoListener?.();
      removeFirebaseListener?.();
    };
  }, [openFromPushData]);

  useEffect(() => {
    if (isInitializing) return;

    appReadyRef.current = true;

    const flushPending = async () => {
      const handled = await handleAndroidNotificationLaunch({ coldStart: true });
      if (handled) return;

      const pending = consumePendingPushRoute();
      if (pending) {
        navigateFromPushNotification(pending, { coldStart: true });
      }
    };

    const timer = setTimeout(() => {
      void flushPending();
    }, 600);
    return () => clearTimeout(timer);
  }, [handleAndroidNotificationLaunch, isInitializing]);

  return null;
}
