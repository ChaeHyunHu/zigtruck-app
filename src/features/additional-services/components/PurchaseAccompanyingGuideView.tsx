import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { appColors } from "@/src/constants/colors";

import { PUBLIC_IMAGES } from "../constants";

function ServiceTierCard({
  step,
  title,
  subtitle,
  bullets,
  footer,
}: {
  step: string;
  title: string;
  subtitle?: string;
  bullets: string[];
  footer: string;
}) {
  return (
    <View className="w-full gap-4 rounded-xl bg-white p-5">
      <View className="flex-row items-center justify-center gap-2">
        <View className="h-6 w-6 items-center justify-center rounded-full bg-[#E8EFFF]">
          <Text className="text-[13px] font-bold text-primary">{step}</Text>
        </View>
        <Text className="text-[16px] font-bold text-gray900">{title}</Text>
      </View>
      {subtitle ? (
        <Text className="text-center text-[13px] font-semibold text-gray800">{subtitle}</Text>
      ) : null}
      {bullets.map((bullet) => (
        <View
          key={bullet}
          className="items-center rounded-xl bg-gray200 p-3"
        >
          <Text className="text-center text-[15px] font-semibold text-gray800">
            {bullet}
          </Text>
        </View>
      ))}
      <View className="flex-row items-center justify-center gap-1 px-1">
        <Ionicons name="checkmark-circle" size={14} color={appColors.primary} />
        <Text className="text-center text-[13px] text-primary">{footer}</Text>
      </View>
    </View>
  );
}

export function PurchaseAccompanyingGuideView() {
  const [feeOpen, setFeeOpen] = useState(false);

  return (
    <View>
      <View className="items-center bg-gray200 px-4 pt-8">
        <Image
          source={{ uri: PUBLIC_IMAGES.purchaseAccompanyingGuide }}
          style={{ width: 76, height: 54 }}
          contentFit="contain"
        />
        <Text className="mt-4 text-center text-[14px] font-medium text-gray700">
          화물차 구매가 망설여지거나{"\n"}구매 절차에 도움이 필요하신 분이라면
        </Text>
        <Text className="pb-8 pt-2 text-center text-[24px] font-bold text-gray900">
          구매 동행 서비스로{"\n"}차량을 안전하게 구매하세요
        </Text>
      </View>

      <View className="gap-4 bg-gray200 px-4 pb-8">
        <ServiceTierCard
          step="1"
          title="차량 진단 평가 서비스"
          bullets={[
            "직트럭 협력 진단 평가사가 직접 방문",
            "사고·누유 등 전체적인 차량 상태 점검",
            "차량 검사 후 진단 평가서 제공",
          ]}
          footer="차량 구매 전 기본적인 점검만 필요하신 분에게 적합"
        />
        <ServiceTierCard
          step="2"
          title="차량 구매 원스톱 서비스"
          subtitle="차량 검수·계약·이전서류·행정절차를 한번에 해결"
          bullets={[
            "사고·누유 등 전체적인 차량 상태 점검",
            "수리 비용 산출 및 적절한 금액 협의",
            "차량 계약·이전 서류 절차 안내",
            "차량 대금·저당·압류 해지 등 행정 절차 지원",
            "10만원 이내의 차량 탁송 서비스 지원",
          ]}
          footer="차량 구매에 필요한 모든 절차를 한 번에 해결하고 싶으신 분에게 적합"
        />

        <View className="rounded-xl bg-white p-5">
          <Pressable
            className="flex-row items-center justify-between"
            onPress={() => setFeeOpen((prev) => !prev)}
          >
            <Text className="text-[16px] font-semibold text-gray900">수수료 안내</Text>
            <Ionicons
              name={feeOpen ? "chevron-up" : "chevron-down"}
              size={20}
              color={appColors.gray600}
            />
          </Pressable>
          {feeOpen ? (
            <View className="mt-3 gap-2 border-t border-gray300 pt-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-[14px] text-gray800">차량 진단 평가 서비스</Text>
                <Text className="text-[14px] font-semibold text-gray900">25 ~ 30만원</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-[14px] text-gray800">차량 구매 원스톱 서비스</Text>
                <Text className="text-[14px] font-semibold text-gray900">50만원</Text>
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}
