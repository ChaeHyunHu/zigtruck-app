import LottieView from "lottie-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const SEARCHING_ANIMATION = require("@/assets/animations/car-register-search.json");

type Props = {
  message?: string;
};

/** 소유자명 조회 중 — 페이지 위 오버레이 + 검색 Lottie */
export function CarRegisterLoadingOverlay({
  message = "데이터를 조회중입니다. 잠시만 기다려주세요.",
}: Props) {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="auto">
      <View style={StyleSheet.absoluteFillObject} className="bg-black/75" />
      <View
        style={StyleSheet.absoluteFillObject}
        className="items-center justify-center px-6"
      >
        <LottieView
          source={SEARCHING_ANIMATION}
          autoPlay
          loop
          style={{ width: 280, height: 200 }}
        />
        <Text className="mt-5 text-center text-[15px] leading-[22px] text-white">
          {message}
        </Text>
      </View>
    </View>
  );
}
