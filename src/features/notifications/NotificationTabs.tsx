import React from "react";
import { Pressable, Text, View } from "react-native";

import { appColors } from "@/src/constants/colors";

type NotificationTabsProps = {
  tabIndex: number;
  activityUnread: number;
  interestUnread: number;
  onChange: (index: number) => void;
};

function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  const label = count > 99 ? "99+" : String(count);
  return (
    <View className="ml-1 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5">
      <Text className="text-[11px] font-semibold text-white">{label}</Text>
    </View>
  );
}

export function NotificationTabs({
  tabIndex,
  activityUnread,
  interestUnread,
  onChange,
}: NotificationTabsProps) {
  return (
    <View className="border-b border-gray300 bg-white">
      <View className="flex-row">
        <Pressable
          onPress={() => onChange(0)}
          className="flex-1 items-center justify-center py-3"
        >
          <View className="flex-row items-center">
            <Text
              className={`text-[16px] ${
                tabIndex === 0 ? "font-semibold text-gray900" : "text-gray600"
              }`}
            >
              활동 알림
            </Text>
            <UnreadBadge count={activityUnread} />
          </View>
          {tabIndex === 0 ? (
            <View className="absolute bottom-0 h-[2px] w-full bg-gray900" />
          ) : null}
        </Pressable>
        <Pressable
          onPress={() => onChange(1)}
          className="flex-1 items-center justify-center py-3"
        >
          <View className="flex-row items-center">
            <Text
              className={`text-[16px] ${
                tabIndex === 1 ? "font-semibold text-gray900" : "text-gray600"
              }`}
            >
              관심 차량 알림
            </Text>
            <UnreadBadge count={interestUnread} />
          </View>
          {tabIndex === 1 ? (
            <View className="absolute bottom-0 h-[2px] w-full bg-gray900" />
          ) : null}
        </Pressable>
      </View>
    </View>
  );
}
