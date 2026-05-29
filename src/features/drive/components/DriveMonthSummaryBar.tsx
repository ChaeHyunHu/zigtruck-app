import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

import { appColors } from "@/src/constants/colors";
import { formatDisplayYYYYMM } from "@/src/features/drive/driveDateUtils";

type Props = {
  leftPrefix?: string;
  leftValue: React.ReactNode;
  month: Date;
  canGoNext: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  rightSlot?: React.ReactNode;
};

export function DriveMonthSummaryBar({
  leftPrefix = "총",
  leftValue,
  month,
  canGoNext,
  onPrevMonth,
  onNextMonth,
  rightSlot,
}: Props) {
  return (
    <View className="mx-4 mb-2 mt-2 flex-row items-center justify-between rounded-lg bg-[#F8FAFF] p-4">
      <View className="flex-1 pr-2">
        {typeof leftValue === "string" ? (
          <Text className="text-[15px] font-semibold text-gray900">
            {leftPrefix ? (
              <Text className="font-medium text-gray700">{leftPrefix} </Text>
            ) : null}
            {leftValue}
          </Text>
        ) : (
          leftValue
        )}
        {rightSlot}
      </View>
      <View className="h-[43px] w-px bg-gray300" />
      <View className="ml-2 flex-row items-center">
        <Pressable hitSlop={12} onPress={onPrevMonth}>
          <Ionicons name="chevron-back" size={18} color={appColors.gray800} />
        </Pressable>
        <Text className="mx-2 min-w-[72px] text-center text-[17px] font-semibold text-gray900">
          {formatDisplayYYYYMM(month)}
        </Text>
        <Pressable hitSlop={12} onPress={onNextMonth} disabled={!canGoNext}>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={canGoNext ? appColors.gray800 : appColors.gray400}
          />
        </Pressable>
      </View>
    </View>
  );
}
