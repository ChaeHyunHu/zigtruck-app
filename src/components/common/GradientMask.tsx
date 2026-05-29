import { Ionicons } from "@expo/vector-icons";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, View, type TextProps, type TextStyle } from "react-native";

/** zigtruck-front blueGradient-blue-to-blue */
export const BLUE_GRADIENT = ["#535AFF", "#397AFF", "#10ACFF"] as const;

const GRADIENT_START = { x: 1, y: 0 } as const;
const GRADIENT_END = { x: 0, y: 1 } as const;

type GradientTextProps = TextProps & {
  children: React.ReactNode;
  colors?: readonly string[];
  style?: TextStyle | TextStyle[];
};

/** 그라데이션으로 채워지는 텍스트 (MaskedView) */
export function GradientText({
  children,
  colors = BLUE_GRADIENT,
  style,
  ...rest
}: GradientTextProps) {
  return (
    <MaskedView
      maskElement={
        <Text {...rest} style={style}>
          {children}
        </Text>
      }
    >
      <LinearGradient
        colors={[...colors]}
        start={GRADIENT_START}
        end={GRADIENT_END}
      >
        <Text {...rest} style={[style, { opacity: 0 }]}>
          {children}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
}

type GradientIconProps = {
  name: React.ComponentProps<typeof Ionicons>["name"];
  size?: number;
  colors?: readonly string[];
};

/** 그라데이션으로 채워지는 Ionicons (MaskedView) */
export function GradientIcon({
  name,
  size = 26,
  colors = BLUE_GRADIENT,
}: GradientIconProps) {
  return (
    <MaskedView
      style={{ width: size, height: size }}
      maskElement={
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "transparent",
          }}
        >
          <Ionicons name={name} size={size} color="#000" />
        </View>
      }
    >
      <LinearGradient
        colors={[...colors]}
        start={GRADIENT_START}
        end={GRADIENT_END}
        style={{ flex: 1 }}
      />
    </MaskedView>
  );
}
