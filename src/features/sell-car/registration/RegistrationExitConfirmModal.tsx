import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

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
  // RN Modal 대신 같은 화면 안 absoluteFill 오버레이로 렌더한다.
  // 나가기 시 화면을 전환하는데, RN Modal이 dismiss 되는 도중 네비게이션하면
  // iOS에서 투명 레이어가 남아 이동한 화면의 터치가 막히는(먹통) 문제가 있어서다.
  if (!visible) return null;
  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 2000, elevation: 2000 }]}>
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
    </View>
  );
}
