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
      <View className="flex-1 items-center justify-center bg-black/35 p-5">
        <View className="w-full rounded-xl bg-white p-4">
          {title ? (
            <Text className="text-center text-[17px] font-bold text-gray900">{title}</Text>
          ) : null}
          <View className={title ? "mt-2" : ""}>{content}</View>
          <View className="mt-4 flex-row justify-end gap-2">
            <Pressable className="rounded-md bg-gray200 px-4 py-2" onPress={onCancel}>
              <Text className="font-semibold text-gray800">취소</Text>
            </Pressable>
            <Pressable className="rounded-md bg-primary px-4 py-2" onPress={onConfirm}>
              <Text className="font-bold text-white">{rightLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
