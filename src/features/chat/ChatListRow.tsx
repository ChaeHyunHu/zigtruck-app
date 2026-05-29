import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, Text, View } from "react-native";

import { appColors } from "@/src/constants/colors";
import { resolveImageUri } from "@/src/features/products/utils";

import { formatChatListPreview } from "./utils";
import { formatChatTimeAgo } from "./dateUtils";
import type { ChatListItem } from "./types";

type ChatListRowProps = {
  item: ChatListItem;
  unreadCount: number;
  onPress: () => void;
};

export function ChatListRow({ item, unreadCount, onPress }: ChatListRowProps) {
  const profileUri = resolveImageUri(item.profileImageUrl);
  const productUri = resolveImageUri(item.productRepresentImageUrl);

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center border-b border-gray200 px-4 py-3"
    >
      {profileUri ? (
        <Image
          source={{ uri: profileUri }}
          style={{ width: 48, height: 48, borderRadius: 24 }}
          contentFit="cover"
        />
      ) : (
        <View className="h-12 w-12 items-center justify-center rounded-full bg-gray200">
          <Ionicons name="person" size={24} color={appColors.gray500} />
        </View>
      )}

      <View className="ml-2 min-h-12 flex-1 justify-center pr-2">
        <View className="flex-row flex-wrap items-center">
          <Text className="text-[15px] font-semibold text-gray900" numberOfLines={1}>
            {item.memberName ?? "판매자"}
          </Text>
          {item.truckNumber ? (
            <Text className="text-[13px] text-gray700">[{item.truckNumber}]</Text>
          ) : null}
          {item.lastMessageTime ? (
            <Text className="text-[12px] text-gray500">
              {item.truckNumber ? " · " : ""}
              {formatChatTimeAgo(item.lastMessageTime)}
            </Text>
          ) : null}
        </View>
        <Text
          className={`mt-1 text-[13px] leading-[18px] ${unreadCount > 0 ? "font-medium text-gray900" : "text-gray600"}`}
          numberOfLines={2}
        >
          {formatChatListPreview(item.lastMessage)}
        </Text>
      </View>

      <View className="relative ml-1 h-12 w-12">
        {productUri ? (
          <Image
            source={{ uri: productUri }}
            style={{ width: 48, height: 48, borderRadius: 12 }}
            contentFit="cover"
          />
        ) : (
          <View className="h-12 w-12 items-center justify-center rounded-xl bg-gray200">
            <Ionicons name="car-outline" size={22} color={appColors.gray500} />
          </View>
        )}
        {unreadCount > 0 ? (
          <View className="absolute -bottom-0.5 -left-1 min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#F5222D] px-1">
            <Text className="text-[11px] font-bold leading-[14px] text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
