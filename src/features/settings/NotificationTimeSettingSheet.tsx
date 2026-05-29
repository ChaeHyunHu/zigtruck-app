import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BottomSheet,
  BottomSheetHeader,
} from "@/src/components/common/BottomSheet";
import {
  AMPM_OPTIONS,
  HOUR_OPTIONS,
  hourToPickerIndices,
  pickerIndicesToHour,
} from "@/src/features/settings/driveHistoryTimeUtils";
import { NotificationTimeWheelColumn } from "@/src/features/settings/NotificationTimeWheelColumn";

type Props = {
  visible: boolean;
  defaultHour: number;
  isApplying?: boolean;
  onClose: () => void;
  onApply: (hour: number) => void | Promise<void>;
};

export function NotificationTimeSettingSheet({
  visible,
  defaultHour,
  isApplying = false,
  onClose,
  onApply,
}: Props) {
  const insets = useSafeAreaInsets();
  const [amPmIndex, setAmPmIndex] = useState(0);
  const [timeIndex, setTimeIndex] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const { amPmIndex: am, timeIndex: time } = hourToPickerIndices(defaultHour);
    setAmPmIndex(am);
    setTimeIndex(time);
  }, [defaultHour, visible]);

  const handleApply = useCallback(() => {
    const hour = pickerIndicesToHour(amPmIndex, timeIndex);
    void onApply(hour);
  }, [amPmIndex, onApply, timeIndex]);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      heightRatio={0.36}
      contentLayout="hug"
      topDismissArea
    >
      <BottomSheetHeader title="시간 설정" onClose={onClose} bordered={false} dense />
      <View className="items-center justify-center px-4 pb-2 pt-1">
        <View className="flex-row items-center justify-center gap-6">
          <NotificationTimeWheelColumn
            items={AMPM_OPTIONS}
            selectedIndex={amPmIndex}
            onChange={setAmPmIndex}
          />
          <NotificationTimeWheelColumn
            items={HOUR_OPTIONS}
            selectedIndex={timeIndex}
            onChange={setTimeIndex}
          />
        </View>
      </View>
      <View
        className="bg-white px-4 pt-2"
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      >
        <Pressable
          onPress={handleApply}
          disabled={isApplying}
          className="h-[48px] items-center justify-center rounded-xl bg-primary"
          style={{ opacity: isApplying ? 0.7 : 1 }}
        >
          {isApplying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-[16px] font-bold text-white">적용</Text>
          )}
        </Pressable>
      </View>
    </BottomSheet>
  );
}
