import React from "react";
import { Modal, Pressable, Text, View } from "react-native";

type RegistrationExitConfirmModalProps = {
  visible: boolean;
  onContinue: () => void;
  onExit: () => void;
};

export function RegistrationExitConfirmModal({
  visible,
  onContinue,
  onExit,
}: RegistrationExitConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onContinue}
    >
      <View className="flex-1 items-center justify-center bg-black/40 px-8">
        <View className="w-full max-w-[320px] overflow-hidden rounded-2xl bg-white">
          <Text className="px-5 pb-2 pt-6 text-center text-[18px] font-bold text-gray900">
            정말 나가시겠어요?
          </Text>
          <Text className="px-5 pb-5 text-center text-[15px] leading-[22px] text-gray700">
            작성 중인 내용은 임시저장되며{"\n"}언제든지 재등록이 가능합니다.
          </Text>
          <View className="flex-row border-t border-gray300">
            <Pressable
              onPress={onContinue}
              className="h-[52px] flex-1 items-center justify-center border-r border-gray300"
            >
              <Text className="text-[16px] text-gray600">계속 등록</Text>
            </Pressable>
            <Pressable
              onPress={onExit}
              className="h-[52px] flex-1 items-center justify-center"
            >
              <Text className="text-[16px] font-semibold text-primary">나가기</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
