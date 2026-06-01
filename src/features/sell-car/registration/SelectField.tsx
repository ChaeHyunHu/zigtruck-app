import { Ionicons } from "@expo/vector-icons";
import React, { useCallback } from "react";
import { Keyboard, Pressable, Text, View } from "react-native";

import { appColors } from "@/src/constants/colors";

type SelectFieldProps = {
  label: string;
  value?: string;
  placeholder?: string;
  onPress: () => void;
  disabled?: boolean;
};

export const SelectField = React.memo(function SelectField({
  label,
  value,
  placeholder = "선택",
  onPress,
  disabled,
}: SelectFieldProps) {
  const handlePress = useCallback(() => {
    if (disabled) return;
    Keyboard.dismiss();
    onPress();
  }, [disabled, onPress]);

  return (
    <View>
      {label ? (
        <Text className="mb-2 text-[14px] font-medium text-gray700">{label}</Text>
      ) : null}
      <Pressable
        disabled={disabled}
        onPress={handlePress}
        hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        android_disableSound
        className="h-[50px] flex-row items-center justify-between rounded-lg border border-gray300 bg-white px-4"
        style={({ pressed }) => ({
          opacity: disabled ? 0.55 : pressed ? 0.75 : 1,
        })}
      >
        <Text className={`flex-1 text-[16px] ${value ? "text-gray900" : "text-gray500"}`}>
          {value || placeholder}
        </Text>
        {!disabled ? (
          <Ionicons name="chevron-down" size={20} color={appColors.gray700} />
        ) : null}
      </Pressable>
    </View>
  );
});
