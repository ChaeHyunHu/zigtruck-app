import React from "react";
import { Pressable, Text, View } from "react-native";

import { AppSwitch } from "@/src/components/common/AppSwitch";
import { appColors } from "@/src/constants/colors";
import { Ionicons } from "@expo/vector-icons";

type BaseRowProps = {
  title: string;
  description?: string;
  onPress?: () => void;
  rightText?: string;
};

export const ListRow = React.memo(function ListRow({
  title,
  description,
  onPress,
  rightText,
}: BaseRowProps) {
  return (
    <Pressable
      onPress={onPress}
      className="min-h-[68px] flex-row items-center justify-between  bg-white px-4 py-[14px]"
      android_ripple={{ color: appColors.gray100 }}
    >
      <View className="mr-3 flex-1">
        <Text className="text-[16px] font-semibold text-black">{title}</Text>
        {description ? (
          <Text className="mt-1 text-[13px] text-gray700">{description}</Text>
        ) : null}
      </View>
      <Text className="text-[16px] font-bold text-gray500">
        {rightText ?? (
          <Ionicons
            name="chevron-forward"
            size={22}
            color={appColors.gray500}
          />
        )}
      </Text>
    </Pressable>
  );
});

type SwitchRowProps = {
  title: string;
  description?: string;
  value: boolean;
  onChange: (next: boolean) => void;
};

export const SwitchRow = React.memo(function SwitchRow({
  title,
  description,
  value,
  onChange,
}: SwitchRowProps) {
  return (
    <View className="flex-row items-center justify-between border-b border-border bg-white px-4 py-3">
      <View className="mr-3 flex-1">
        <Text className="text-[16px] font-semibold text-black">{title}</Text>
        {description ? (
          <Text className="mt-0.5 text-[13px] text-gray700">{description}</Text>
        ) : null}
      </View>
      <AppSwitch value={value} onValueChange={onChange} />
    </View>
  );
});
