import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { appColors } from "@/src/constants/colors";

type DriveFormRowProps = {
  label: string;
  required?: boolean;
  onPress?: () => void;
  /** 읽기 전용 선택 행 */
  value?: string;
  placeholder?: string;
  /** 직접 입력 행 */
  editable?: boolean;
  onChangeText?: (text: string) => void;
  unit?: string;
  keyboardType?: "default" | "number-pad" | "decimal-pad";
  rightElement?: React.ReactNode;
};

export function DriveFormRow({
  label,
  required,
  onPress,
  value = "",
  placeholder = "",
  editable,
  onChangeText,
  unit,
  keyboardType = "default",
  rightElement,
}: DriveFormRowProps) {
  const showValue = Boolean(value?.trim());

  const trailing =
    rightElement ??
    (editable ? (
      unit ? (
        <Text className="ml-2 text-[16px] font-medium text-gray800">{unit}</Text>
      ) : null
    ) : (
      <Ionicons name="chevron-forward" size={20} color={appColors.gray600} />
    ));

  const content = (
    <View className="flex-row items-center border-b border-gray300 px-4 py-5">
      <Text className="min-w-[100px] text-[15px] text-gray700">
        {label}
        {required ? <Text className="font-normal text-danger"> (필수)</Text> : null}
      </Text>
      {editable ? (
        <TextInput
          className="flex-1 px-3 text-[16px] text-gray900"
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={appColors.gray600}
          keyboardType={keyboardType}
        />
      ) : (
        <Text
          className={`flex-1 px-3 text-[16px] ${
            showValue ? "text-gray900" : "text-gray600"
          }`}
          numberOfLines={2}
        >
          {showValue ? value : placeholder}
        </Text>
      )}
      {trailing}
    </View>
  );

  if (onPress && !editable) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }
  return content;
}
