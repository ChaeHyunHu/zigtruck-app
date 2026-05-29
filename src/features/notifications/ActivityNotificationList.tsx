import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { ActivityIndicator, Alert, FlatList, Text, View } from "react-native";

import { deleteNotification } from "@/src/api/public";
import { appColors } from "@/src/constants/colors";
import { NotificationListItem } from "@/src/features/notifications/NotificationListItem";
import type { MemberNotification } from "@/src/features/notifications/types";
import { openNotificationRedirect } from "@/src/features/notifications/utils";
import {
  markNotificationsReadOnLeave,
  useNotifications as useNotificationsContext,
} from "@/src/providers/NotificationProvider";

type ActivityNotificationListProps = {
  isEditMode: boolean;
  items: MemberNotification[];
  isLoading: boolean;
  notReadCount: number;
};

export function ActivityNotificationList({
  isEditMode,
  items,
  isLoading,
  notReadCount,
}: ActivityNotificationListProps) {
  const router = useRouter();
  const { removeNotification, markTabRead } = useNotificationsContext();
  const notReadRef = useRef(notReadCount);
  notReadRef.current = notReadCount;

  useEffect(() => {
    return () => {
      if (notReadRef.current > 0) {
        markTabRead("activity");
        void markNotificationsReadOnLeave("activity").catch(() => undefined);
      }
    };
  }, [markTabRead]);

  const onDelete = async (id: number) => {
    try {
      await deleteNotification(id);
      removeNotification(id, "activity");
    } catch {
      Alert.alert("오류", "알림을 삭제하지 못했습니다.");
    }
  };

  if (isLoading && items.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <ActivityIndicator color={appColors.primary} />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-6 py-20">
        <Ionicons name="notifications-off-outline" size={80} color={appColors.gray400} />
        <Text className="mt-4 text-[17px] text-gray700">받은 알림이 없어요.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={{ paddingBottom: 32 }}
      renderItem={({ item }) => (
        <NotificationListItem
          item={item}
          variant="activity"
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
  );
}
