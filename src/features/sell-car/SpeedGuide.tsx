import { Image } from "expo-image";
import React from "react";
import { Text, View } from "react-native";

import { appColors } from "@/src/constants/colors";
import { IMAGE_BASE_URL } from "@/src/constants/url";

const STEPS = [
  "직트럭 담당자와 견적 상담",
  "차량 실차 확인 후 최종 협의",
  "차량 계약 및 필요 서류 준비",
  "잔금 처리 후 차량 인도",
];

export const SpeedGuide = React.memo(function SpeedGuide() {
  return (
    <View className="px-4 py-[46px]">
      <Text className="mb-[10px] text-center text-[14px] text-gray700">
        차량을 즉시 처분해야 하나요?
      </Text>
      <Text className="pb-[10px] text-center text-[20px] font-semibold text-gray900">
        개인 딜러가 제시하는 금액 보다{"\n"}손해는 적고, 처분은 빠르게!
      </Text>

      <View className="mt-4 items-center rounded-[10px] bg-gray100 px-6 py-6">
        <Text className="text-center text-[20px] font-bold text-gray900">
          타사 견적 대비{"\n"}
          <Text style={{ color: appColors.primary }}>최대 300만원 더!</Text>
        </Text>
        <Image
          source={{ uri: `${IMAGE_BASE_URL}/graph.png` }}
          className="mt-4 h-[142px] w-[184px]"
          contentFit="contain"
        />
      </View>

      <View className="mt-[50px] h-2 w-full bg-gray100" />

      <Text className="mt-10 text-center text-[20px] font-semibold text-gray900">
        매입 절차는{"\n"}이렇게 진행돼요
      </Text>

      <View className="mt-6 gap-6">
        {STEPS.map((step, index) => (
          <View key={step} className="flex-row items-center">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-gray300">
              <Text className="font-bold text-gray700">{index + 1}</Text>
            </View>
            <Text className="ml-2 flex-1 text-sm text-gray900">{step}</Text>
          </View>
        ))}
      </View>
    </View>
  );
});
