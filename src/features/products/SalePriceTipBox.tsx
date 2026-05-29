import React from "react";
import { Text, View } from "react-native";

type SalePriceTipBoxProps = {
  /** 외부 여백 등 추가 클래스 */
  className?: string;
};

/** 차량정보수정 판매가격 탭 기준 판매 팁 박스 (좌측 액센트 바 + 판매 팁 배지) */
export function SalePriceTipBox({ className }: SalePriceTipBoxProps) {
  return (
    <View className={`overflow-hidden rounded-lg bg-[#F1F5FF] ${className ?? ""}`}>
      <View className="flex-row">
        <View className="w-[4px] bg-primary" />
        <View className="flex-1 px-4 py-4">
          <View className="mb-2 self-start rounded bg-primary px-2 py-1">
            <Text className="text-[12px] font-bold text-white">판매 팁</Text>
          </View>
          <Text className="text-[15px] font-bold leading-[22px] text-gray900">
            지금 차량 금액을 낮추면 매물이 상단으로 노출 됩니다.
          </Text>
          <Text className="mt-1 text-[13px] leading-[18px] text-gray600">
            빠른 판매를 위해서 최소 50만원 이상 낮추시는걸 권장드립니다.
          </Text>
        </View>
      </View>
    </View>
  );
}
