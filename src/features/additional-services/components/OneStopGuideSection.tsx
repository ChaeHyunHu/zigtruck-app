import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

import { appColors } from "@/src/constants/colors";

const steps = [
  { icon: "car-sport-outline" as const, lines: ["차량", "판매 등록"] },
  { icon: "headset-outline" as const, lines: ["구매자", "고객 상담"] },
  { icon: "checkmark-circle-outline" as const, lines: ["차량", "판매 완료"] },
];

const recommendations = [
  "어플 사용에 어려움을 느끼시는 분",
  "시간 제약으로 구매자 응대가 어려우신 분",
  "거래 절차가 번거롭게 느껴지시는 분",
];

export function OneStopGuideSection() {
  return (
    <View>
      <View className="items-center px-4 pt-6">
        <Text className="pb-9 text-center text-[24px] font-bold text-gray900">
          직거래 위탁판매 서비스란?
        </Text>
        <Text className="text-center text-[15px] leading-[22px] text-gray800">
          차량 판매 등록, 구매자 상담,{"\n"}거래 완료 시점까지{"\n"}모든 판매 과정을
          {"\n"}한번에 도와드리는 서비스입니다.
        </Text>

        <View className="flex-row flex-wrap justify-center gap-3 py-[34px]">
          {steps.map((step) => (
            <View
              key={step.icon}
              className="h-[90px] w-[90px] items-center justify-center rounded-[25px] bg-gray200"
            >
              <Ionicons name={step.icon} size={34} color={appColors.primary} />
              <Text className="mt-1.5 text-center text-[14px] font-semibold leading-4 text-gray900">
                {step.lines.join("\n")}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className="items-center bg-gray200 px-4 py-[46px]">
        <Text className="mb-6 text-[24px] font-bold text-gray900">이런 분에게 추천해요</Text>
        {recommendations.map((item) => (
          <View key={item} className="mb-3.5 w-full max-w-[320px] flex-row gap-1">
            <Ionicons name="checkmark-circle" size={18} color={appColors.primary} />
            <Text className="flex-1 text-[15px] font-medium text-gray800">{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
