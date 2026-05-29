import React from "react";
import { Modal, Pressable, Text, View } from "react-native";

type ProductPriceReduceNoticeModalProps = {
  visible: boolean;
  onConfirm: () => void;
};

/** 원래 가격 대비 50만원(만원 단위 50) 이상 인하 시 노출 */
export function ProductPriceReduceNoticeModal({
  visible,
  onConfirm,
}: ProductPriceReduceNoticeModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onConfirm}
    >
      <View className="flex-1 items-center justify-center bg-black/35 px-6">
        <View className="w-full max-w-[320px] overflow-hidden rounded-xl bg-white">
          <Text className="px-4 pb-2 pt-6 text-center text-[18px] font-bold text-gray900">
            차량 판매 금액 수정 완료
          </Text>
          <Text className="px-4 pb-6 text-center text-[15px] leading-[22px] text-gray800">
            50만원 이상 수정되어{"\n"}해당 차량이 상단에 노출돼요.
          </Text>
          <Pressable
            className="min-h-[52px] items-center justify-center border-t border-gray300"
            onPress={onConfirm}
          >
            <Text className="text-[16px] font-semibold text-primary">확인</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export function shouldShowPriceReduceNotice(
  originalPrice: number,
  nextPrice: number,
): boolean {
  return (
    Number.isFinite(originalPrice) &&
    originalPrice > 0 &&
    Number.isFinite(nextPrice) &&
    nextPrice <= originalPrice - 50
  );
}
