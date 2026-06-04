import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React, { useEffect } from "react";
import { Platform, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientIcon, GradientText } from "@/src/components/common/GradientMask";
import { appColors } from "@/src/constants/colors";
import { TAB_BAR_BASE_HEIGHT } from "@/src/constants/layout";
import { preloadHomeBanners } from "@/src/features/home/homeBannerCache";
import { useAuth } from "@/src/hooks/useAuth";
import { useChat } from "@/src/providers/ChatProvider";
import { useAppLoadingOverlay } from "@/src/providers/AppLoadingProvider";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const TAB_LABEL_STYLE = { fontSize: 12, fontWeight: "600" as const };

function renderTabIcon(name: IoniconName) {
  return function TabIcon({
    focused,
    color,
  }: {
    focused: boolean;
    color: string;
  }) {
    if (focused) return <GradientIcon name={name} size={26} />;
    return <Ionicons size={26} name={name} color={color} />;
  };
}

function renderTabLabel(title: string) {
  return function TabLabel({ focused }: { focused: boolean }) {
    if (focused) {
      return <GradientText style={TAB_LABEL_STYLE}>{title}</GradientText>;
    }
    return (
      <Text style={[TAB_LABEL_STYLE, { color: appColors.gray600 }]}>
        {title}
      </Text>
    );
  };
}

export default function TabLayout() {
  const { isInitializing, isAuthenticated } = useAuth();
  const { totalUnread } = useChat();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    void preloadHomeBanners();
  }, []);
  const tabBarPaddingBottom =
    Platform.OS === "android"
      ? insets.bottom > 0
        ? insets.bottom
        : 6
      : Math.max(insets.bottom, 8);
  const chatTabBadge =
    isAuthenticated && totalUnread > 0
      ? totalUnread > 99
        ? "99+"
        : String(totalUnread)
      : undefined;

  useAppLoadingOverlay(isInitializing);

  if (isInitializing) {
    return <View className="flex-1 bg-white" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: appColors.primary,
        tabBarInactiveTintColor: appColors.gray600,
        headerShown: false,
        sceneStyle: { flex: 1, backgroundColor: appColors.white },
        tabBarStyle: {
          backgroundColor: appColors.white,
          borderTopColor: appColors.gray300,
          height: TAB_BAR_BASE_HEIGHT + tabBarPaddingBottom,
          paddingTop: 6,
          paddingBottom: tabBarPaddingBottom,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",
          tabBarIcon: renderTabIcon("home-outline"),
          tabBarLabel: renderTabLabel("홈"),
        }}
      />
      <Tabs.Screen
        name="purchase"
        options={{
          title: "내차구매",
          tabBarIcon: renderTabIcon("search-outline"),
          tabBarLabel: renderTabLabel("내차구매"),
        }}
      />
      <Tabs.Screen
        name="manage"
        options={{
          title: "내차관리",
          tabBarIcon: renderTabIcon("car-sport-outline"),
          tabBarLabel: renderTabLabel("내차관리"),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "채팅",
          tabBarBadge: chatTabBadge,
          tabBarBadgeStyle: {
            backgroundColor: "#F5222D",
            color: "#FFFFFF",
            fontSize: 11,
            minWidth: 18,
            height: 18,
            lineHeight: 18,
          },
          tabBarIcon: renderTabIcon("chatbubble-ellipses-outline"),
          tabBarLabel: renderTabLabel("채팅"),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "더보기",
          tabBarIcon: renderTabIcon("ellipsis-horizontal-circle-outline"),
          tabBarLabel: renderTabLabel("더보기"),
        }}
      />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
