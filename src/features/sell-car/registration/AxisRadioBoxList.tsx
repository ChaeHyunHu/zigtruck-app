import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

import { appColors } from "@/src/constants/colors";

import type { EnumPresenter } from "./types";

type AxisRadioBoxListProps = {
  options: EnumPresenter[];
  value?: string;
  disabled?: boolean;
  onSelect: (item: EnumPresenter) => void;
};

export const AxisRadioBoxList = React.memo(function AxisRadioBoxList({
  options,
  value,
  disabled,
  onSelect,
}: AxisRadioBoxListProps) {
  return (
    <View className="flex-row gap-2">
      {options.map((item, index) => {
        const selected = value === item.code;
        const isDisabled = Boolean(disabled);
        return (
          <Pressable
            key={item.code ?? index}
            className="flex-1 flex-row items-center rounded-lg border px-3 py-3"
            style={{
              borderColor: selected ? appColors.primary : appColors.gray300,
              backgroundColor: isDisabled ? appColors.gray200 : appColors.white,
              opacity: isDisabled && !selected ? 0.85 : 1,
            }}
            onPress={() => {
              if (!isDisabled) onSelect(item);
            }}
          >
            <Ionicons
              name={selected ? "checkmark-circle" : "checkmark-circle-outline"}
              size={22}
              color={selected ? appColors.primary : isDisabled ? appColors.gray500 : appColors.gray400}
            />
            <Text
              className={`ml-1 flex-1 text-[15px] ${selected ? "font-bold text-primary" : "text-gray800"}`}
              numberOfLines={1}
            >
              {item.desc}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
});
