import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { getInterestProductsNotificationSettings } from "@/src/api/public";
import { Screen } from "@/src/components/common/Screen";
import { appColors } from "@/src/constants/colors";
import { InterestNotificationFormScreen } from "@/src/features/interest-notification-settings/InterestNotificationFormScreen";
import type { InterestNotificationSettingItem } from "@/src/features/interest-notification-settings/types";
import { normalizeInterestNotificationSettings } from "@/src/features/interest-notification-settings/utils";
import { RegistrationHeader } from "@/src/features/sell-car/registration/RegistrationHeader";

export default function InterestNotificationEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const settingId = Number(id);
  const [setting, setSetting] = useState<InterestNotificationSettingItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void getInterestProductsNotificationSettings()
      .then((res) => {
        const list = normalizeInterestNotificationSettings(res.data);
        const match = list.find((item) => item.id === settingId) ?? null;
        setSetting(match);
      })
      .finally(() => setLoading(false));
  }, [settingId]);

  if (loading) {
    return (
      <Screen variant="stack" className="flex-1 bg-white">
        <RegistrationHeader title="관심 차량 수정" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={appColors.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <InterestNotificationFormScreen settingId={settingId} initialSetting={setting} />
  );
}
