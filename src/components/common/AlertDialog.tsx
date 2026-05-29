import React from "react";
import { Modal, Pressable, Text, View } from "react-native";

type AlertDialogProps = {
  visible: boolean;
  title?: string;
  message?: string;
  children?: React.ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
};

export function AlertDialog({
  visible,
  title,
  message,
  children,
  confirmLabel = "확인",
  onConfirm,
}: AlertDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onConfirm}>
      <View className="flex-1 items-center justify-center bg-black/35 px-6">
        <View className="w-full max-w-[320px] overflow-hidden rounded-xl bg-white">
          {title ? (
            <Text className="px-4 pb-2 pt-6 text-center text-[20px] font-semibold text-gray900">
              {title}
            </Text>
          ) : null}
          <View className={`px-4 ${title ? "pb-4" : "py-6"}`}>
            {children ??
              (message ? (
                <Text className="text-center text-[15px] leading-[22px] text-gray700">
                  {message}
                </Text>
              ) : null)}
          </View>
          <View className="border-t border-gray300">
            <Pressable
              className="min-h-[52px] items-center justify-center"
              onPress={onConfirm}
            >
              <Text className="text-[16px] font-semibold text-primary">{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
