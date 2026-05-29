import * as Linking from "expo-linking";
import type { Href } from "expo-router";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef } from "react";
import { AppState } from "react-native";

import { useAuth } from "@/src/hooks/useAuth";
import {
  consumePendingPushRoute,
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

function pushLog(...args: unknown[]) {
  if (__DEV__) {
    console.log("[push-nav]", ...args);
  }
}

function navigateToRoute(href: Href) {
  const path = String(href);
  pushLog("navigateToRoute", path);
  try {
    if (path.startsWith("/(tabs)") || path === "/(tabs)") {
      router.replace(href);
      return;
    }
    router.push(href);
  } catch {
    setPendingPushRoute(href);
  }
}

function navigateFromPushUrl(url: string | null) {
  if (!url) return;
  pushLog("navigateFromPushUrl", url);
  const href = resolveHrefFromDeepLinkUrl(url);
  if (href) {
    navigateToRoute(href);
  }
}

export function PushNotificationBootstrap() {
  const { isInitializing, syncPushToken } = useAuth();
  const lastOpenedRouteRef = useRef<string | null>(null);
  const appReadyRef = useRef(false);

  const openFromPushData = useCallback((data: Record<string, unknown> | undefined) => {
    pushLog("openFromPushData", data);
    const href = resolveHrefFromPushData(data);
    if (!href) return;

    const routeKey = String(href);
    if (lastOpenedRouteRef.current === routeKey) return;
    lastOpenedRouteRef.current = routeKey;
    setTimeout(() => {
      if (lastOpenedRouteRef.current === routeKey) {
        lastOpenedRouteRef.current = null;
      }
    }, 3000);

    if (!appReadyRef.current || isInitializing) {
      setPendingPushRoute(href);
      return;
    }

    navigateToRoute(href);
  }, [isInitializing]);

  const runSyncPushToken = useCallback(() => {
    void syncPushToken();
  }, [syncPushToken]);

  const handleAndroidNotificationLaunch = useCallback(async () => {
    const url = await consumeAndroidLaunchPushUrl();
    pushLog("consumeAndroidLaunchPushUrl", url);
    if (!url) return;

    const href = resolveHrefFromDeepLinkUrl(url);
    if (!href) return;

    if (!appReadyRef.current || isInitializing) {
      setPendingPushRoute(href);
      return;
    }

    navigateToRoute(href);
  }, [isInitializing]);

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

    void handleAndroidNotificationLaunch();

    const appStateSub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        runSyncPushToken();
        void handleAndroidNotificationLaunch();
      }
    });

    return () => {
      removeTokenListener?.();
      appStateSub.remove();
    };
  }, [handleAndroidNotificationLaunch, runSyncPushToken]);

  useEffect(() => {
    let removeExpoListener: (() => void) | undefined;
    let removeFirebaseListener: (() => void) | undefined;

    void subscribeToNotificationResponses((response) => {
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
    const handleUrl = (event: { url: string }) => {
      navigateFromPushUrl(event.url);
    };

    const subscription = Linking.addEventListener("url", handleUrl);

    void Linking.getInitialURL().then((url) => {
      if (url) {
        const href = resolveHrefFromDeepLinkUrl(url);
        if (href) {
          setPendingPushRoute(href);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (isInitializing) return;

    appReadyRef.current = true;

    const flushPending = () => {
      const pending = consumePendingPushRoute();
      if (pending) {
        navigateToRoute(pending);
        return;
      }
      void handleAndroidNotificationLaunch();
    };

    const timer = setTimeout(flushPending, 400);
    return () => clearTimeout(timer);
  }, [handleAndroidNotificationLaunch, isInitializing]);

  return null;
}
