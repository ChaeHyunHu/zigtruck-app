import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

const SEARCHING_IMAGE = require("@/assets/images/car-register-searching.png");

type Props = {
  message?: string;
};

/** 소유자명 조회 중 — 페이지 위 오버레이 + 돋보기 애니메이션 */
export function CarRegisterLoadingOverlay({
  message = "데이터를 조회중입니다. 잠시만 기다려주세요.",
}: Props) {
  const sweep = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const sweepLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sweep, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sweep, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    sweepLoop.start();
    pulseLoop.start();

    return () => {
      sweepLoop.stop();
      pulseLoop.stop();
    };
  }, [pulse, sweep]);

  const translateX = sweep.interpolate({
    inputRange: [0, 1],
    outputRange: [-14, 14],
  });
  const rotate = sweep.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["-6deg", "0deg", "6deg"],
  });
  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1.04],
  });

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="auto">
      <View style={StyleSheet.absoluteFillObject} className="bg-black/75" />
      <View
        style={StyleSheet.absoluteFillObject}
        className="items-center justify-center px-6"
      >
        <Animated.Image
          source={SEARCHING_IMAGE}
          resizeMode="contain"
          style={{
            width: 96,
            height: 96,
            transform: [{ translateX }, { rotate }, { scale }],
          }}
        />
        <Text className="mt-5 text-center text-[15px] leading-[22px] text-white">
          {message}
        </Text>
      </View>
    </View>
  );
}
