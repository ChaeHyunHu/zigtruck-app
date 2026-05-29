import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

import { appColors } from "@/src/constants/colors";

type SalesTypeSelectButtonProps = {
  onPressDirect: () => void;
  onPressSpeed: () => void;
};

export const SalesTypeSelectButton = React.memo(function SalesTypeSelectButton({
  onPressDirect,
  onPressSpeed,
}: SalesTypeSelectButtonProps) {
  return (
    <View className="mt-[30px] gap-2 px-4">
      <Pressable
        className="min-h-[116px] rounded-2xl px-4 py-[22px]"
        style={{ backgroundColor: appColors.primary }}
        onPress={onPressDirect}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-[19px] font-bold text-white">직거래 셀프 판매</Text>
          <Ionicons name="chevron-forward" size={22} color={appColors.white} />
        </View>
        <Text className="mt-[14px] text-[14px] font-medium leading-[17px] text-white">
          수수료없이 무료로 등록하세요.{"\n"}구매자와 직접 거래하는 방식입니다.
        </Text>
      </Pressable>

      <Pressable
        className="min-h-[116px] rounded-2xl border px-4 py-[22px]"
        style={{ borderColor: appColors.primary }}
        onPress={onPressSpeed}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-[19px] font-bold" style={{ color: appColors.primary }}>
            직트럭에 즉시 매각
          </Text>
          <Ionicons name="chevron-forward" size={22} color={appColors.primary} />
        </View>
        <Text
          className="mt-[14px] text-[14px] font-medium leading-[17px]"
          style={{ color: appColors.primary }}
        >
          직트럭 전문가와 매입 견적{"\n"}상담을 통해 즉시 차량을 판매하세요.
        </Text>
      </Pressable>
    </View>
  );
});
