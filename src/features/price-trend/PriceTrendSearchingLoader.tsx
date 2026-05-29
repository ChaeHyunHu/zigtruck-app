import React, { useEffect, useRef } from "react";
import { Animated, Easing, Image, Text, View } from "react-native";

const SEARCHING_IMAGE = require("@/assets/images/price-trend-searching.png");

/** 직거래 시세 로딩 중 — 돋보기가 좌우로 훑는 검색 애니메이션 */
export function PriceTrendSearchingLoader() {
  const sweep = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const dots = useRef(new Animated.Value(0)).current;

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

    const dotsLoop = Animated.loop(
      Animated.timing(dots, {
        toValue: 3,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    );

    sweepLoop.start();
    pulseLoop.start();
    dotsLoop.start();

    return () => {
      sweepLoop.stop();
      pulseLoop.stop();
      dotsLoop.stop();
    };
  }, [sweep, pulse, dots]);

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
    <View className="items-center py-10">
      <Animated.Image
        source={SEARCHING_IMAGE}
        resizeMode="contain"
        style={{
          width: 88,
          height: 88,
          transform: [{ translateX }, { rotate }, { scale }],
        }}
      />
      <View className="mt-4 flex-row items-center">
        <Text className="text-[15px] font-semibold text-gray800">
          시세를 검색하고 있어요
        </Text>
        <AnimatedDots value={dots} />
      </View>
      <Text className="mt-1 text-[13px] text-gray600">잠시만 기다려주세요</Text>
    </View>
  );
}

function AnimatedDots({ value }: { value: Animated.Value }) {
  const [count, setCount] = React.useState(0);

  useEffect(() => {
    const id = value.addListener(({ value: v }) => {
      setCount(Math.floor(v) % 4);
    });
    return () => value.removeListener(id);
  }, [value]);

  return (
    <Text className="text-[15px] font-semibold text-gray800" style={{ width: 18 }}>
      {".".repeat(count)}
    </Text>
  );
}
