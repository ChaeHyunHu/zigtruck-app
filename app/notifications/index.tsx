import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";

import { LoginRequiredView } from "@/src/components/auth/LoginRequiredView";
import { Screen } from "@/src/components/common/Screen";
import {
  NOTIFICATION_TAB_ACTIVITY,
  NOTIFICATION_TAB_INTEREST,
} from "@/src/features/notifications/constants";
import { ActivityNotificationList } from "@/src/features/notifications/ActivityNotificationList";
import { InterestNotificationList } from "@/src/features/notifications/InterestNotificationList";
import { NotificationTabs } from "@/src/features/notifications/NotificationTabs";
import { RegistrationHeader } from "@/src/features/sell-car/registration/RegistrationHeader";
import { useAuth } from "@/src/hooks/useAuth";
import { useNotifications } from "@/src/providers/NotificationProvider";

export default function NotificationsScreen() {
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { data, isLoading, refresh } = useNotifications();
  const [tabIndex, setTabIndex] = useState(0);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    if (tab === NOTIFICATION_TAB_INTEREST) {
      setTabIndex(1);
    } else if (tab === NOTIFICATION_TAB_ACTIVITY) {
      setTabIndex(0);
    }
  }, [tab]);

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        void refresh({ silent: true });
      }
    }, [isAuthenticated, refresh]),
  );

  if (!isAuthenticated) {
    return (
      <Screen variant="stack" className="flex-1 bg-white">
        <RegistrationHeader title="알림" onBack={() => router.back()} />
        <LoginRequiredView message="로그인 후 알림을 확인할 수 있어요." />
      </Screen>
    );
  }

  const editButton = (
    <Pressable onPress={() => setIsEdit((prev) => !prev)} hitSlop={8}>
      <Text className="text-[14px] text-gray800">{isEdit ? "닫기" : "편집"}</Text>
    </Pressable>
  );

  return (
    <Screen variant="stack" className="flex-1 bg-white">
      <RegistrationHeader title="알림" onBack={() => router.back()} rightElement={editButton} />
      <NotificationTabs
        tabIndex={tabIndex}
        activityUnread={data?.notReadActivityNotificationCount ?? 0}
        interestUnread={data?.notReadInterestProductNotificationCount ?? 0}
        onChange={setTabIndex}
      />
      <View className="flex-1">
        {tabIndex === 0 ? (
          <ActivityNotificationList
            isEditMode={isEdit}
            items={data?.activityNotifications ?? []}
            isLoading={isLoading}
            notReadCount={data?.notReadActivityNotificationCount ?? 0}
          />
        ) : (
          <InterestNotificationList
            isEditMode={isEdit}
            items={data?.interestProductNotifications ?? []}
            isLoading={isLoading}
            notReadCount={data?.notReadInterestProductNotificationCount ?? 0}
          />
        )}
      </View>
    </Screen>
  );
}
