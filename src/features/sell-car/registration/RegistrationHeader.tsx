import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

import { appColors } from "@/src/constants/colors";

type RegistrationHeaderProps = {
  title: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
};

export const RegistrationHeader = React.memo(function RegistrationHeader({
  title,
  onBack,
  rightElement,
}: RegistrationHeaderProps) {
  return (
    <View className="h-[52px] flex-row items-center border-b border-gray300 px-4">
      <Pressable
        onPress={onBack ?? (() => router.back())}
        hitSlop={8}
        className="mr-2"
      >
        <Ionicons name="chevron-back" size={26} color={appColors.gray900} />
      </Pressable>
      <Text className="flex-1 text-[16px] font-semibold text-gray900" numberOfLines={1}>
        {title}
      </Text>
      {rightElement}
    </View>
  );
});
