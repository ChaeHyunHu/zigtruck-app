import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

import { appColors } from "@/src/constants/colors";

import type { RadioOption } from "@/src/features/price-trend/PriceTrendRadioGroup";

type LicenseSaleChoiceGroupProps = {
  options: RadioOption[];
  value: string;
  onChange: (code: string) => void;
};

export function LicenseSaleChoiceGroup({
  options,
  value,
  onChange,
}: LicenseSaleChoiceGroupProps) {
  return (
    <View className="gap-3">
      {options.map((option) => {
        const selected = value === option.code;
        return (
          <Pressable
            key={option.code}
            onPress={() => onChange(option.code)}
            className="flex-row items-center rounded-lg border px-4 py-3.5"
            style={{
              borderColor: selected ? appColors.primary : appColors.gray300,
              backgroundColor: selected ? "#F1F5FF" : appColors.gray200,
            }}
          >
            <Ionicons
              name={selected ? "checkmark-circle" : "checkmark-circle-outline"}
              size={22}
              color={selected ? appColors.primary : appColors.gray500}
            />
            <Text
              className={`ml-2 flex-1 text-[15px] ${
                selected ? "font-bold text-primary" : "font-medium text-gray700"
              }`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
