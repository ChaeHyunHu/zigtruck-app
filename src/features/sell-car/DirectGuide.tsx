import React from "react";
import { Text, View } from "react-native";

import { appColors } from "@/src/constants/colors";

const TAGS = ["#판매 수수료 없는 무료 등록", "#평균 10일 이내 판매완료"];

const SERVICES = [
  {
    title: "거래 데이터 기반",
    description: "내 차량의 적정 시세 확인 가능",
  },
  {
    title: "안심번호로 개인 정보 보호",
    description: "구매자와 안전하게 전화 연결 가능",
  },
  {
    title: "빠른 거래를 위한 맞춤 알림 서비스",
    description: "유사 차량을 찾는 고객에게 알림 전송",
  },
  {
    title: "국토부 차량 정보를 반영",
    description: "무분별한 허위 매물 방지까지",
  },
];

export const DirectGuide = React.memo(function DirectGuide() {
  return (
    <View>
      <View className="bg-gray100 px-6 py-[30px]">
        <Text className="text-[18px] leading-[22px] text-gray800">
          직트럭에서 딜러없이{"\n"}
          <Text className="text-[20px] font-bold leading-[24px]">500만원 더 높게 판매하세요</Text>
        </Text>
        <Text className="mt-1 text-[12px] font-medium text-gray700">
          (대형화물차 평균 판매 금액 기준)
        </Text>
        <View className="mt-6 gap-2">
          {TAGS.map((tag) => (
            <View
              key={tag}
              className="self-start rounded-[20px] px-3 py-[10px]"
              style={{ backgroundColor: "#E8F0FF" }}
            >
              <Text className="text-[12px] font-semibold text-primary">{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="items-center px-4 py-[46px]">
        <Text className="mb-6 text-center text-[20px] font-bold leading-[24px] text-gray800">
          직거래 판매가 합리적인 이유
        </Text>
        <Text className="text-center text-[14px] font-semibold leading-[18px] text-gray800">
          직거래는 판매자, 구매자가 직접 거래하기 때문에{"\n"}
          <Text style={{ color: appColors.primary }}>
            중간마진(딜러마진, 상품화비용, 부대수수료 등)이 없는 합리적인 거래가 가능합니다.
          </Text>
        </Text>
      </View>

      <View className="bg-gray100 px-6 py-[46px]">
        <Text className="text-center text-[20px] font-bold text-gray800">직트럭 제공 서비스</Text>
        <View className="mt-[34px] gap-[34px]">
          {SERVICES.map((item) => (
            <View key={item.title}>
              <Text className="text-[14px] font-semibold leading-[18px] text-gray700">
                {item.title}
              </Text>
              <Text className="text-[14px] font-semibold leading-[18px] text-gray800">
                {item.description}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
});
