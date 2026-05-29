import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

import { appColors } from "@/src/constants/colors";
import type { JobEnumField } from "@/src/features/job/types";

type Props = {
  label: string;
  selected?: JobEnumField;
  onPress: () => void;
  onRemove?: () => void;
};

/** 웹 JobSearch — 근무 지역/요일/시간 선택 행 */
export function JobSearchFilterRow({
  label,
  selected,
  onPress,
  onRemove,
}: Props) {
  const hasSelection = Boolean(selected?.code);

  return (
    <View className="border-b border-gray300">
      <Pressable
        onPress={onPress}
        className="flex-row items-center px-4 py-4"
      >
        <Text className="flex-1 text-[16px] font-semibold text-gray800">
          {label}
        </Text>
        <Ionicons name="chevron-forward" size={20} color={appColors.gray400} />
      </Pressable>
      {hasSelection ? (
        <View className="flex-row flex-wrap gap-2 px-4 pb-3">
          <View className="flex-row items-center rounded-full bg-gray100 px-3 py-1.5">
            <Text className="text-[14px] text-gray800">{selected?.desc}</Text>
            {onRemove ? (
              <Pressable onPress={onRemove} hitSlop={8} className="ml-1.5">
                <Ionicons name="close-circle" size={18} color={appColors.gray600} />
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}
    </View>
  );
}
