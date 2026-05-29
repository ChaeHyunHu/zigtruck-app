import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

import { appColors } from "@/src/constants/colors";

type UnderlineSelectFieldProps = {
  placeholder: string;
  value?: string;
  onPress: () => void;
};

export const UnderlineSelectField = React.memo(function UnderlineSelectField({
  placeholder,
  value,
  onPress,
}: UnderlineSelectFieldProps) {
  return (
    <Pressable className="w-full py-3" onPress={onPress}>
      <View className="flex-row items-center border-b border-gray300 pb-2">
        <Text
          className={`flex-1 text-[18px] ${value ? "text-gray900" : "text-gray500"}`}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={appColors.gray800} />
      </View>
    </Pressable>
  );
});
