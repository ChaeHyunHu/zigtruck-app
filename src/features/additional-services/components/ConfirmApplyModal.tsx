import React from "react";
import { Modal, Pressable, Text, View } from "react-native";

type ConfirmApplyModalProps = {
  visible: boolean;
  title?: string;
  content: React.ReactNode;
  rightLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmApplyModal({
  visible,
  title,
  content,
  rightLabel = "신청하기",
  onCancel,
  onConfirm,
}: ConfirmApplyModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center bg-black/35 px-8">
        <View className="w-full max-w-[340px] overflow-hidden rounded-2xl bg-white">
          <View className="items-center px-5 pb-7 pt-8">
            {title ? (
              <Text className="mb-2 text-center text-[17px] font-bold text-gray900">
                {title}
              </Text>
            ) : null}
            {content}
          </View>
          <View className="flex-row border-t border-gray200">
            <Pressable className="flex-1 items-center py-4" onPress={onCancel}>
              <Text className="text-[16px] font-medium text-gray500">취소</Text>
            </Pressable>
            <View className="w-px bg-gray200" />
            <Pressable className="flex-1 items-center py-4" onPress={onConfirm}>
              <Text className="text-[16px] font-bold text-primary">{rightLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
