import React from "react";
import { Pressable, Text, View } from "react-native";

export type RadioOption = {
  code: string;
  label: string;
};

type PriceTrendRadioGroupProps = {
  label: string;
  required?: boolean;
  options: RadioOption[];
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
  horizontal?: boolean;
  /** 선택 시 테두리·글자색 (미지정 시 primary) */
  accentColor?: string;
  /** 선택 시 배경색 (미지정 시 #F0F5FF) */
  selectedBgColor?: string;
};

export function PriceTrendRadioGroup({
  label,
  required,
  options,
  value,
  onChange,
  disabled,
  horizontal = true,
  accentColor,
  selectedBgColor = "#F1F5FF",
}: PriceTrendRadioGroupProps) {
  return (
    <View>
      <Text className="mb-3 text-[15px] font-semibold text-gray800">
        {label}
        {required ? <Text className="font-normal text-danger"> (필수)</Text> : null}
      </Text>
      <View
        className={horizontal ? "flex-row gap-2" : "gap-3"}
        style={horizontal ? { columnGap: 8 } : undefined}
      >
        {options.map((option) => {
          const selected = value === option.code;
          const isNoneOption = option.code === "NONE";
          const useAccent = !disabled && selected && accentColor;
          const buttonClass = disabled
            ? selected && isNoneOption
              ? "border-gray500 bg-gray300"
              : selected
                ? "border-gray400 bg-gray200"
                : "border-gray300 bg-gray200"
            : selected
              ? accentColor
                ? ""
                : "border-primary bg-primary-1"
              : "border-gray300 bg-white";
          const textClass = disabled
            ? selected && isNoneOption
              ? "font-semibold text-gray800"
              : "font-medium text-gray600"
            : selected
              ? accentColor
                ? "font-bold"
                : "font-bold text-primary"
              : "font-medium text-gray800";

          return (
            <Pressable
              key={option.code}
              disabled={disabled}
              onPress={() => onChange(option.code)}
              className={`min-h-[44px] items-center justify-center rounded-lg border px-2 py-2 ${
                horizontal ? "min-w-0 flex-1" : "w-full"
              } ${buttonClass}`}
              style={
                useAccent
                  ? {
                      borderColor: accentColor,
                      backgroundColor: selectedBgColor,
                    }
                  : undefined
              }
            >
              <Text
                className={`text-center text-[15px] ${textClass}`}
                style={useAccent ? { color: accentColor } : undefined}
                numberOfLines={1}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
