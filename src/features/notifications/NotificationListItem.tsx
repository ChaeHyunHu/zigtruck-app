import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, Text, View } from "react-native";

import { appColors } from "@/src/constants/colors";
import type { MemberNotification } from "@/src/features/notifications/types";
import { calculateTimeAgo } from "@/src/features/notifications/utils";

const ZIGTRUCK_LOGO = require("@/assets/images/icon.png");

type NotificationListItemProps = {
  item: MemberNotification;
  isEditMode: boolean;
  variant: "activity" | "interest";
  onPress: () => void;
  onDelete: () => void;
};

export function NotificationListItem({
  item,
  isEditMode,
  variant,
  onPress,
  onDelete,
}: NotificationListItemProps) {
  const notification = item.notification;
  const isPriceCut = notification.notificationType?.code === "INTEREST_PRODUCT_PRICE_CUT";
  const imageUri = notification.imageUrl?.trim() || null;

  return (
    <Pressable
      onPress={onPress}
      className={`relative flex-row px-4 py-4 ${item.isRead ? "bg-white" : ""}`}
      style={!item.isRead ? { backgroundColor: appColors.blueUnread } : undefined}
    >
      <View
        className={`mr-2 overflow-hidden bg-gray200 ${
          variant === "activity" ? "h-[52px] w-[52px] rounded-full" : "h-[52px] w-[52px] rounded-lg"
        }`}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} className="h-full w-full" contentFit="cover" />
        ) : variant === "activity" ? (
          <Image source={ZIGTRUCK_LOGO} className="h-full w-full" contentFit="cover" />
        ) : (
          <View className="h-full w-full items-center justify-center bg-gray200">
            <Ionicons name="car-outline" size={24} color={appColors.gray500} />
          </View>
        )}
      </View>

      <View className="min-w-0 flex-1 pr-8">
        <View className="mb-1 flex-row flex-wrap items-center">
          {variant === "interest" && isPriceCut ? (
            <View className="mr-1 rounded-full bg-gray200 px-1.5 py-0.5">
              <Text className="text-[11px] font-semibold text-red-500">₩ 할인</Text>
            </View>
          ) : null}
          <Text className="flex-shrink text-[15px] font-semibold text-gray900" numberOfLines={2}>
            {notification.title}
          </Text>
        </View>
        <Text className="mb-1 text-[13px] text-gray700" numberOfLines={2}>
          {notification.contents}
        </Text>
        <Text className="text-[12px] text-gray500">
          {calculateTimeAgo(notification.sentDate)}
        </Text>
      </View>

      {isEditMode ? (
        <Pressable
          onPress={(e) => {
            e.stopPropagation?.();
            onDelete();
          }}
          hitSlop={12}
          className="absolute right-4 top-4"
        >
          <Ionicons name="close" size={22} color={appColors.gray800} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}
