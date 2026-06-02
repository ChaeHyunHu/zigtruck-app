import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import * as SystemUI from "expo-system-ui";
import "react-native-reanimated";
import "../global.css";
import "@/src/lib/nativewind";
import { useEffect } from "react";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { PushNotificationBootstrap } from "@/src/components/notifications/PushNotificationBootstrap";
import { AuthProvider } from "@/src/providers/AuthProvider";
import { ChatProvider } from "@/src/providers/ChatProvider";
import { NotificationProvider } from "@/src/providers/NotificationProvider";
import { AppDialogProvider } from "@/src/providers/AppDialogProvider";
import { ToastProvider } from "@/src/providers/ToastProvider";

SplashScreen.preventAutoHideAsync().catch(() => {});

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (Platform.OS === "android") {
      void SystemUI.setBackgroundColorAsync("#FFFFFF").catch(() => {});
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <AuthProvider>
          <ChatProvider>
            <NotificationProvider>
            <AppDialogProvider>
            <ToastProvider>
            <PushNotificationBootstrap />
            <ThemeProvider
              value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen
                  name="intro"
                  options={{ headerShown: false, animation: "fade" }}
                />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="settings" options={{ headerShown: false }} />
                <Stack.Screen
                  name="notification-settings"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="notifications/index"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="notifications/products/index"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="notifications/products/form"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="notifications/products/[id]"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="product/[id]"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="product/filter"
                  options={{ presentation: "modal", headerShown: false }}
                />
                <Stack.Screen
                  name="product/edit/[id]"
                  options={{ headerShown: false }}
                />
                <Stack.Screen name="license" options={{ headerShown: false }} />
                <Stack.Screen name="job" options={{ headerShown: false }} />
                <Stack.Screen name="drive" options={{ headerShown: false }} />
                <Stack.Screen
                  name="chat/room/[id]"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="sell-car"
                  options={{ headerShown: false }}
                />
                <Stack.Screen name="guide/sale" options={{ headerShown: false }} />
                <Stack.Screen name="guide/perchase" options={{ headerShown: false }} />
                <Stack.Screen name="notice/index" options={{ headerShown: false }} />
                <Stack.Screen name="notice/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="terms/index" options={{ headerShown: false }} />
                <Stack.Screen name="terms/[type]" options={{ headerShown: false }} />
                <Stack.Screen
                  name="products/sales"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="products/purchase/inquiry"
                  options={{ headerShown: false }}
                />
                <Stack.Screen name="contract/index" options={{ headerShown: false }} />
                <Stack.Screen
                  name="modal"
                  options={{
                    presentation: "modal",
                    title: "Modal",
                    headerShown: true,
                  }}
                />
              </Stack>
              <StatusBar style="auto" translucent={false} />
            </ThemeProvider>
            </ToastProvider>
            </AppDialogProvider>
            </NotificationProvider>
          </ChatProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
