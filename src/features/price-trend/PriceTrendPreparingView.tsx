import LottieView from "lottie-react-native";
import React from "react";
import { Text, View } from "react-native";

const PREPARING_ANIMATION = require("@/assets/animations/price-trend-preparing.json");

/** 직거래 시세 로딩·데이터 없음 공통 UI (그래프 자리 Lottie) */
export function PriceTrendPreparingView() {
  return (
    <View className="items-center justify-center pb-6">
      <LottieView
        source={PREPARING_ANIMATION}
        autoPlay
        loop
        style={{ width: 112, height: 93 }}
      />
      <Text className="my-3 text-center text-[15px] text-gray800">
        해당 차량의{"\n"}평균 직거래 시세 정보를 준비중입니다.
      </Text>
      <Text className="text-center text-[13px] leading-[18px] text-gray600">
        직거래 시세 정보가 있는 경우 여기에 표시되며,{"\n"}
        차량의 주행거리, 차량의 상태, 옵션 등에 따라{"\n"}
        시세가 변동될 수 있습니다.
      </Text>
    </View>
  );
}
