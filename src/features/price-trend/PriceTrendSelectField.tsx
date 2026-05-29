import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

import { appColors } from "@/src/constants/colors";

type PriceTrendSelectFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  required?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  rightElement?: React.ReactNode;
};

export function PriceTrendSelectField({
  label,
  placeholder,
  value,
  required,
  disabled = false,
  onPress,
  rightElement,
}: PriceTrendSelectFieldProps) {
  const showValue = Boolean(value?.trim());

  return (
    <View>
      {label ? (
        <Text className="mb-2 text-[14px] font-semibold text-gray800">
          {label}
          {required ? (
            <Text className="font-normal text-danger"> (필수)</Text>
          ) : null}
        </Text>
      ) : null}
      <Pressable
        disabled={disabled}
        onPress={onPress ?? (() => {})}
        hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
        style={({ pressed }) => ({
          opacity: disabled ? 0.55 : pressed ? 0.75 : 1,
        })}
      >
        <View
          className={`min-h-[48px] flex-row items-center rounded-lg border px-3 ${
            disabled ? "border-gray200 bg-gray100" : "border-gray300 bg-white"
          }`}
        >
          <Text
            className={`flex-1 py-3 text-[16px] ${
              showValue
                ? disabled
                  ? "text-gray500"
                  : "font-medium text-gray900"
                : disabled
                  ? "text-gray400"
                  : "text-gray600"
            }`}
            numberOfLines={1}
          >
            {showValue ? value : placeholder}
          </Text>
          {rightElement ??
            (!disabled ? (
              <Ionicons name="chevron-down" size={20} color={appColors.gray800} />
            ) : null)}
        </View>
      </Pressable>
    </View>
  );
}
