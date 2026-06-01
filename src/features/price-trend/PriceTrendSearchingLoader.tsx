import { Image } from "expo-image";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, Text, View } from "react-native";

const SEARCHING_IMAGE = require("@/assets/images/price-trend-searching.gif");

/** 직거래 시세 로딩 중 — 돋보기 GIF + 안내 문구 */
export function PriceTrendSearchingLoader() {
  const dots = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const dotsLoop = Animated.loop(
      Animated.timing(dots, {
        toValue: 3,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    );

    dotsLoop.start();
    return () => dotsLoop.stop();
  }, [dots]);

  return (
    <View className="items-center py-10">
      <Image
        source={SEARCHING_IMAGE}
        style={{ width: 88, height: 88 }}
        contentFit="contain"
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
