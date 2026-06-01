import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const SEARCHING_IMAGE = require("@/assets/images/car-register-searching.gif");

type Props = {
  message?: string;
};

/** 소유자명 조회 중 — 페이지 위 오버레이 + 돋보기 GIF */
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
        <Image
          source={SEARCHING_IMAGE}
          style={{ width: 96, height: 96 }}
          contentFit="contain"
        />
        <Text className="mt-5 text-center text-[15px] leading-[22px] text-white">
          {message}
        </Text>
      </View>
    </View>
  );
}
