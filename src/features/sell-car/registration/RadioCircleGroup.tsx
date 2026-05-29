import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

import { appColors } from "@/src/constants/colors";

type RadioCircleGroupProps = {
  options: Array<{ code: string; desc: string }>;
  value: string;
  onChange: (code: string) => void;
};

export const RadioCircleGroup = React.memo(function RadioCircleGroup({
  options,
  value,
  onChange,
}: RadioCircleGroupProps) {
  return (
    <View className="flex-row gap-6 px-1">
      {options.map((item) => {
        const selected = value === item.code;
        return (
          <Pressable
            key={item.code}
            className="flex-row items-center"
            onPress={() => onChange(item.code)}
          >
            <Ionicons
              name={selected ? "radio-button-on" : "radio-button-off"}
              size={22}
              color={selected ? appColors.primary : appColors.gray400}
            />
            <Text className={`ml-2 text-[16px] ${selected ? "font-semibold text-gray900" : "text-gray700"}`}>
              {item.desc}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
});
