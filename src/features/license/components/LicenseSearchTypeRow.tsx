import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

import { appColors } from "@/src/constants/colors";

type Props = {
  label: string;
  value: string;
  onPress: () => void;
};

/** 웹 번호판 검색 — 번호판 종류 행 (라벨 + 값 + chevron) */
export function LicenseSearchTypeRow({ label, value, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center border-b border-t border-gray300 px-4 py-4"
    >
      <Text className="w-[100px] text-[16px] font-semibold text-gray800">
        {label}
      </Text>
      <Text
        className="mr-2 flex-1 text-right text-[16px] font-medium text-gray800"
        numberOfLines={1}
      >
        {value}
      </Text>
      <Ionicons name="chevron-forward" size={20} color={appColors.gray400} />
    </Pressable>
  );
}
