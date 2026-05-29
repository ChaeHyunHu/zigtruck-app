import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";

import { deleteNotification, getInterestProductsNotificationSettings } from "@/src/api/public";
import { BasicButton } from "@/src/components/common/BasicButton";
import { appColors } from "@/src/constants/colors";
import { NotificationListItem } from "@/src/features/notifications/NotificationListItem";
import type {
  InterestProductNotificationSetting,
  MemberNotification,
} from "@/src/features/notifications/types";
import { openNotificationRedirect } from "@/src/features/notifications/utils";
import {
  markNotificationsReadOnLeave,
  useNotifications as useNotificationsContext,
} from "@/src/providers/NotificationProvider";

type InterestNotificationListProps = {
  isEditMode: boolean;
  items: MemberNotification[];
  isLoading: boolean;
  notReadCount: number;
};

export function InterestNotificationList({
  isEditMode,
  items,
  isLoading,
  notReadCount,
}: InterestNotificationListProps) {
  const router = useRouter();
  const { removeNotification, markTabRead } = useNotificationsContext();
  const [settingsCount, setSettingsCount] = useState(0);
  const notReadRef = useRef(notReadCount);
  notReadRef.current = notReadCount;

  const loadSettingsCount = useCallback(async () => {
    try {
      const res = await getInterestProductsNotificationSettings();
      const list = (res.data ?? []) as InterestProductNotificationSetting[];
      setSettingsCount(list.length);
    } catch {
      setSettingsCount(0);
    }
  }, []);

  useEffect(() => {
    void loadSettingsCount();
  }, [loadSettingsCount]);

  useEffect(() => {
    return () => {
      if (notReadRef.current > 0) {
        markTabRead("interest");
        void markNotificationsReadOnLeave("interest").catch(() => undefined);
      }
    };
  }, [markTabRead]);

  const onDelete = async (id: number) => {
    try {
      await deleteNotification(id);
      removeNotification(id, "interest");
    } catch {
      Alert.alert("오류", "알림을 삭제하지 못했습니다.");
    }
  };

  const onPressSettings = () => {
    router.push("/notifications/products");
  };

  const headerBar = (
    <View className="flex-row items-center justify-between border-b border-gray300 bg-white px-4 py-3">
      <View className="flex-row items-center">
        <Ionicons name="notifications-outline" size={18} color={appColors.gray900} />
        <Text className="ml-1 text-[14px] text-gray800">
          알림 받는 관심 차량 {settingsCount}대
        </Text>
      </View>
      <Pressable
        onPress={onPressSettings}
        className="rounded bg-gray200 px-3 py-2"
      >
        <Text className="text-[13px] font-medium text-gray800">관심 차량 설정</Text>
      </Pressable>
    </View>
  );

  if (isLoading && items.length === 0) {
    return (
      <View className="flex-1">
        {headerBar}
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator color={appColors.primary} />
        </View>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View className="flex-1">
        {headerBar}
        <View className="flex-1 items-center justify-center px-6 py-12">
          <Text className="mb-6 text-center text-[17px] leading-6 text-gray700">
            받은 관심 차량 알림이 없습니다.{"\n"}관심 차량을 설정해주세요.
          </Text>
          <View className="w-[200px]">
            <BasicButton
              name="관심 차량 등록"
              bgColor={appColors.primary}
              borderColor={appColors.primary}
              textColor={appColors.white}
              fontSize={16}
              height={48}
              borderRadius={12}
              fontWeight="600"
              onClick={onPressSettings}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {headerBar}
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item }) => (
          <NotificationListItem
            item={item}
            variant="interest"
            isEditMode={isEditMode}
            onPress={() => {
              void openNotificationRedirect(item.notification.redirectUrl, (href) =>
                router.push(href),
              );
            }}
            onDelete={() => void onDelete(item.id)}
          />
        )}
      />
    </View>
  );
}
