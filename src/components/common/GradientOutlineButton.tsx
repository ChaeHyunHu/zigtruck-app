import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, View } from "react-native";

import { BLUE_GRADIENT, GradientText } from "@/src/components/common/GradientMask";

type Props = {
  name: string;
  onClick: () => void;
  height?: number;
  fontSize?: number;
  borderRadius?: number;
};

/** 흰 배경 + blueGradient 보더/텍스트 아웃라인 버튼 (zigtruck-front blueGradient 참고) */
export const GradientOutlineButton = React.memo(function GradientOutlineButton({
  name,
  onClick,
  height = 48,
  fontSize = 16,
  borderRadius = 8,
}: Props) {
  return (
    <Pressable onPress={onClick} className="w-full">
      <LinearGradient
        colors={[...BLUE_GRADIENT]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ borderRadius, padding: 1.5 }}
      >
        <View
          className="w-full items-center justify-center bg-white"
          style={{ height: height - 3, borderRadius: borderRadius - 1 }}
        >
          <GradientText style={{ fontSize, fontWeight: "700" }}>
            {name}
          </GradientText>
        </View>
      </LinearGradient>
    </Pressable>
  );
});
