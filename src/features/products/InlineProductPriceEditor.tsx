import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { formatNumberWithComma } from "@/src/features/home/utils";

type InlineProductPriceEditorProps = {
  value: string;
  onChangeValue: (digits: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
  maxLength?: number;
  placeholder?: string;
};

export function InlineProductPriceEditor({
  value,
  onChangeValue,
  onSave,
  onCancel,
  isSaving = false,
  maxLength = 5,
  placeholder = "판매 가격",
}: InlineProductPriceEditorProps) {
  return (
    <View className="mt-1">
      <View className="mb-2 flex-row items-center rounded-lg border border-gray300 bg-white px-3">
        <TextInput
          value={value ? formatNumberWithComma(value) : ""}
          onChangeText={(text) =>
            onChangeValue(text.replace(/[^\d]/g, "").slice(0, maxLength))
          }
          keyboardType="number-pad"
          className="h-11 flex-1 text-[16px] font-semibold text-gray900"
          placeholder={placeholder}
          placeholderTextColor="#9e9e9e"
          editable={!isSaving}
        />
        <Text className="ml-2 text-[14px] text-gray700">만원</Text>
      </View>
      <View className="flex-row gap-2">
        <Pressable
          className="flex-1 items-center justify-center rounded-lg bg-primary py-3"
          onPress={onSave}
          disabled={isSaving}
        >
          <Text className="text-[15px] font-bold text-white">
            {isSaving ? "저장 중..." : "저장"}
          </Text>
        </Pressable>
        <Pressable
          className="flex-1 items-center justify-center rounded-lg bg-gray300 py-3"
          onPress={onCancel}
          disabled={isSaving}
        >
          <Text className="text-[15px] font-bold text-gray800">취소</Text>
        </Pressable>
      </View>
    </View>
  );
}
