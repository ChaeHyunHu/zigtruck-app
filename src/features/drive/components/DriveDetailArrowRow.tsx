import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

import { appColors } from "@/src/constants/colors";

export type DriveDetailRow = { label: string; value: string };

type Props = {
  rows: DriveDetailRow[];
  onPress?: () => void;
};

export function DriveDetailArrowRow({ rows, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center border-b border-gray200 py-4"
    >
      <View className="flex-1 gap-2">
        {rows.map((row) => (
          <View key={row.label} className="flex-row items-center justify-between">
            <Text className="text-[14px] text-gray700">{row.label}</Text>
            <Text className="text-[14px] font-medium text-gray900">{row.value}</Text>
          </View>
        ))}
      </View>
      {onPress ? (
        <Ionicons name="chevron-forward" size={20} color={appColors.gray600} />
      ) : null}
    </Pressable>
  );
}
