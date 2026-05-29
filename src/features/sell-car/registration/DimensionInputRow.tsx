import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";

import { appColors } from "@/src/constants/colors";

type DimensionInputRowProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
};

export const DimensionInputRow = React.memo(function DimensionInputRow({
  label,
  value,
  onChangeText,
  error,
}: DimensionInputRowProps) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? appColors.danger : focused ? appColors.primary : appColors.gray300;

  return (
    <View className="py-3">
      <View className="flex-row items-center">
        <Text className="min-w-[60px] text-[16px] font-medium text-gray800">{label}</Text>
        <View className="flex-1 flex-row items-center border-b" style={{ borderBottomColor: borderColor }}>
          <TextInput
            className="min-h-[40px] flex-1 py-2 text-[18px] text-gray900"
            style={{ includeFontPadding: false }}
            keyboardType="decimal-pad"
            value={value}
            onChangeText={onChangeText}
            placeholder={`${label} 입력`}
            placeholderTextColor={appColors.gray500}
            maxLength={5}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          <Text className="ml-2 min-w-[20px] text-right text-[16px] text-gray800">m</Text>
        </View>
      </View>
      {error ? <Text className="mt-1 pl-[60px] text-[12px] text-red-500">{error}</Text> : null}
    </View>
  );
});
