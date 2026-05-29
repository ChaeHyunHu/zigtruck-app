import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Pressable, TextInput, View } from "react-native";

import { appColors } from "@/src/constants/colors";

type ChatRoomInputBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onPressPlus?: () => void;
  isSending?: boolean;
  bottomInset: number;
  disabled?: boolean;
};

export function ChatRoomInputBar({
  value,
  onChangeText,
  onSend,
  onPressPlus,
  isSending,
  bottomInset,
  disabled = false,
}: ChatRoomInputBarProps) {
  const canSend = Boolean(value.trim()) && !isSending && !disabled;

  return (
    <View
      className="flex-row items-center border-t border-gray300 bg-white px-4 py-2"
      style={{
        paddingBottom: bottomInset,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 4,
      }}
    >
      <Pressable
        onPress={onPressPlus}
        hitSlop={6}
        className="mr-2.5 h-7 w-7 items-center justify-center rounded-[7px] border-[1.3px] border-gray500"
      >
        <Ionicons name="add" size={22} color={appColors.gray500} />
      </Pressable>

      <TextInput
        className="max-h-[96px] min-h-[40px] flex-1 rounded-full border border-gray300 bg-white px-4 py-2 text-[16px] text-gray900"
        value={value}
        onChangeText={onChangeText}
        placeholder="메시지 보내기"
        placeholderTextColor={appColors.gray500}
        multiline
        editable={!isSending && !disabled}
      />

      <Pressable
        onPress={onSend}
        disabled={!canSend}
        hitSlop={8}
        className="ml-2.5 h-9 w-9 items-center justify-center"
      >
        {isSending ? (
          <ActivityIndicator size="small" color={appColors.primary} />
        ) : (
          <Ionicons
            name="paper-plane"
            size={24}
            color={canSend ? appColors.primary : appColors.gray500}
          />
        )}
      </Pressable>
    </View>
  );
}
