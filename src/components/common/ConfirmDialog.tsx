import React from "react";
import { Modal, Pressable, Text, View } from "react-native";

type ConfirmDialogProps = {
  visible: boolean;
  title?: string;
  children: React.ReactNode;
  leftLabel?: string;
  rightLabel?: string;
  onLeft: () => void;
  onRight?: () => void;
};

export function ConfirmDialog({
  visible,
  title,
  children,
  leftLabel = "닫기",
  rightLabel,
  onLeft,
  onRight,
}: ConfirmDialogProps) {
  const showRight = Boolean(rightLabel && onRight);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onLeft}>
      <View className="flex-1 items-center justify-center bg-black/35 px-6">
        <View className="w-full max-w-[320px] overflow-hidden rounded-xl bg-white">
          {title ? (
            <Text className="px-4 pb-2 pt-6 text-center text-[20px] font-semibold text-gray900">
              {title}
            </Text>
          ) : null}
          <View className={`px-4 ${title ? "pb-4" : "py-6"}`}>{children}</View>
          <View className="flex-row border-t border-gray300">
            <Pressable
              className={`min-h-[52px] flex-1 items-center justify-center ${showRight ? "" : ""}`}
              onPress={onLeft}
            >
              <Text className="text-[16px] font-semibold text-gray600">{leftLabel}</Text>
            </Pressable>
            {showRight ? (
              <Pressable
                className="min-h-[52px] flex-1 items-center justify-center border-l border-gray300"
                onPress={onRight}
              >
                <Text className="text-[16px] font-semibold text-primary">{rightLabel}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}
