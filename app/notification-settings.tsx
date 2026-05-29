import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";

import { AppSwitch } from "@/src/components/common/AppSwitch";
import { Screen } from "@/src/components/common/Screen";
import { appColors } from "@/src/constants/colors";
import { formatDriveHistoryTimeAmPm } from "@/src/features/settings/driveHistoryTimeUtils";
import { NotificationTimeSettingSheet } from "@/src/features/settings/NotificationTimeSettingSheet";
import { RegistrationHeader } from "@/src/features/sell-car/registration/RegistrationHeader";
import {
  useNotificationSettings,
  type NotificationSettingKey,
} from "@/src/features/settings/useNotificationSettings";

type ToggleItem = {
  key: NotificationSettingKey;
  title: string;
  description: string;
};

function NotificationToggleRow({
  title,
  description,
  agreeDate,
  value,
  onChange,
}: {
  title: string;
  description: string;
  agreeDate?: string;
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <View className="flex-row items-center justify-between border-b border-gray300 bg-white px-4 py-3">
      <View className="mr-3 flex-1">
        <Text className="text-[16px] font-semibold leading-[19px] text-gray800">{title}</Text>
        <Text className="mt-1 text-[14px] leading-[17px] text-gray600">{description}</Text>
        {agreeDate ? (
          <Text className="mt-1 text-[14px] leading-[17px] text-gray600">{agreeDate}</Text>
        ) : null}
      </View>
      <AppSwitch value={value} onValueChange={onChange} />
    </View>
  );
}

export default function NotificationSettingsScreen() {
  const { isLoaded, isUpdating, settings, update, updateDriveHistoryTime } =
    useNotificationSettings();
  const [timeSheetVisible, setTimeSheetVisible] = useState(false);

  const mainToggleItems = useMemo<ToggleItem[]>(
    () => [
      { key: "chatting", title: "채팅알림", description: "채팅 메시지 알림" },
      {
        key: "interestProduct",
        title: "관심 차량 알림",
        description: "관심 차량 등록, 변경 알림",
      },
      { key: "trade", title: "거래 알림", description: "가격 인하 알림" },
      {
        key: "driveHistory",
        title: "운행일지 알림",
        description: "운행일지 작성 알림",
      },
    ],
    [],
  );

  const onToggle = useCallback(
    (key: NotificationSettingKey, next: boolean) => {
      if (key === "chatting" && !next) {
        Alert.alert(
          "채팅 알림 해제",
          "새로운 메시지나\n중요한 소식을 놓칠 수 있어요.\n정말 채팅 알림을 해제하시겠어요?",
          [
            { text: "취소", style: "cancel" },
            { text: "해제", style: "destructive", onPress: () => update(key, false) },
          ],
        );
        return;
      }
      update(key, next);
    },
    [update],
  );

  const handleApplyTime = useCallback(
    async (hour: number) => {
      const ok = await updateDriveHistoryTime(hour);
      if (ok) {
        setTimeSheetVisible(false);
      }
    },
    [updateDriveHistoryTime],
  );

  if (!isLoaded) {
    return (
      <Screen variant="stack" className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color={appColors.primary} />
      </Screen>
    );
  }

  const driveTimeLabel = formatDriveHistoryTimeAmPm(settings.driveHistoryHour);

  return (
    <Screen variant="stack" className="flex-1 bg-white">
      <RegistrationHeader title="알림 설정" />

      <View className="bg-white">
        {mainToggleItems.map((item) => (
          <NotificationToggleRow
            key={item.key}
            title={item.title}
            description={item.description}
            value={settings[item.key]}
            onChange={(next) => onToggle(item.key, next)}
          />
        ))}

        {settings.driveHistory ? (
          <Pressable
            onPress={() => setTimeSheetVisible(true)}
            className="flex-row items-center justify-between border-b border-gray300 bg-white px-4 py-3"
          >
            <Text className="text-[16px] font-semibold leading-[19px] text-gray800">
              운행일지 시간 설정
            </Text>
            <View className="flex-row items-center">
              <Text className="text-[16px] text-gray800">{driveTimeLabel}</Text>
              <Ionicons name="chevron-forward" size={18} color={appColors.gray300} />
            </View>
          </Pressable>
        ) : null}

        <View className="h-2 w-full bg-[#FAFAFA]" />

        <NotificationToggleRow
          title="마케팅 알림"
          description="마케팅 정보 수신 동의"
          agreeDate={
            settings.marketing && settings.marketingAgreeDate
              ? settings.marketingAgreeDate
              : undefined
          }
          value={settings.marketing}
          onChange={(next) => onToggle("marketing", next)}
        />
      </View>

      {isUpdating ? (
        <View className="absolute inset-0 items-center justify-center bg-black/10">
          <ActivityIndicator color={appColors.primary} />
        </View>
      ) : null}

      <NotificationTimeSettingSheet
        visible={timeSheetVisible}
        defaultHour={settings.driveHistoryHour}
        isApplying={isUpdating}
        onClose={() => setTimeSheetVisible(false)}
        onApply={handleApplyTime}
      />
    </Screen>
  );
}
