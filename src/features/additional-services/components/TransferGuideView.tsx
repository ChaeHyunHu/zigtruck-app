import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Text, View } from "react-native";

import { appColors } from "@/src/constants/colors";

import { PUBLIC_IMAGES } from "../constants";

const benefits = [
  {
    icon: "document-text-outline" as const,
    subtitle: "명의 이전에 필요한",
    title: "명의 이전 준비서류와",
  },
  {
    icon: "card-outline" as const,
    subtitle: "구매·판매할 차량의",
    title: "차량 대금 처리부터",
  },
  {
    icon: "shield-checkmark-outline" as const,
    subtitle: "안전한 직거래 매칭을 위한",
    title: "거래 시 유의사항까지",
  },
];

export function TransferGuideView() {
  return (
    <View className="bg-gray200">
      <View className="items-center py-10">
        <Text className="mb-[30px] text-center text-[20px] font-medium text-gray900">
          구매·판매할 차량 결정 후{"\n"}어떤 절차를 거쳐야할지 고민된다면
        </Text>
        <Text className="text-center text-[24px] font-bold leading-[36px] text-gray900">
          서류 이전 대행 서비스로{"\n"}한 번에 해결하세요
        </Text>
        <Image
          source={{ uri: PUBLIC_IMAGES.transferAgency }}
          style={{ width: 155, height: 156, marginTop: 20 }}
          contentFit="contain"
        />
      </View>

      <View className="items-center gap-[18px] px-6 pb-6">
        {benefits.map((item) => (
          <View key={item.title} className="w-full flex-row items-center">
            <Ionicons name={item.icon} size={30} color={appColors.primary} />
            <View className="ml-2">
              <Text className="text-[14px] font-medium text-gray700">{item.subtitle}</Text>
              <Text className="text-[16px] font-bold text-gray900">{item.title}</Text>
            </View>
          </View>
        ))}
      </View>

      <View className="items-center px-4 py-[46px]">
        <Text className="text-center text-[15px] leading-[22px] text-gray800">
          서류 이전 대행 서비스는{"\n"}화물차 직거래 매칭 시{"\n"}고객님들의 안전한 거래를 위해
          {"\n"}도움을 드리는 서비스입니다.
        </Text>
        <Text className="mt-[46px] text-[12px] text-gray600">
          ※ 해당 서비스는 유료 서비스입니다.
        </Text>
      </View>
    </View>
  );
}
