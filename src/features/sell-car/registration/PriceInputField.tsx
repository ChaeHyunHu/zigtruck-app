import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";

import { appColors } from "@/src/constants/colors";
import { formatNumberWithComma } from "@/src/features/home/utils";

type PriceInputFieldProps = {
  value?: number | null;
  onChangeValue: (value: number | undefined) => void;
  error?: string;
  placeholder?: string;
  /** true면 하단 안내 문구("* 부가세...")를 숨김 */
  hideHint?: boolean;
};

export const PriceInputField = React.memo(function PriceInputField({
  value,
  onChangeValue,
  error,
  placeholder = "차량 판매 금액 입력",
  hideHint = false,
}: PriceInputFieldProps) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? appColors.danger : focused ? appColors.primary : appColors.gray300;

  return (
    <View>
      <View className="flex-row items-center border-b pb-2" style={{ borderBottomColor: borderColor }}>
        <TextInput
          className="min-h-[44px] flex-1 py-2 text-[18px] text-gray900"
          style={{ includeFontPadding: false }}
          keyboardType="number-pad"
          value={value ? formatNumberWithComma(value) : ""}
          onChangeText={(text) => {
            const digits = text.replace(/[^\d]/g, "");
            onChangeValue(digits ? Number(digits) : undefined);
          }}
          placeholder={placeholder}
          placeholderTextColor={appColors.gray500}
          maxLength={11}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <Text className="ml-3 min-w-[36px] text-right text-[16px] text-gray800">만원</Text>
      </View>
      {error ? <Text className="mt-2 text-[13px] text-red-500">{error}</Text> : null}
      {!error && !hideHint ? (
        <Text className="mt-2 text-[13px] text-gray700">
          * 부가세, 번호판 금액은 제외하고 입력해주세요.
        </Text>
      ) : null}
    </View>
  );
});
