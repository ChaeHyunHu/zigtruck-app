import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import type { ToastType } from "@/src/providers/toast";

type ToastViewProps = {
  message: string;
  type: ToastType;
  opacity: Animated.Value;
  bottomOffset: number;
};

/**
 * zigtruck-front 토스트와 동일한 형태:
 * 하단 중앙, 다크 반투명 pill, 좌측 체크 아이콘 + 흰 텍스트.
 */
export function ToastView({
  message,
  type,
  opacity,
  bottomOffset,
}: ToastViewProps) {
  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, styles.wrapper, { paddingBottom: bottomOffset }]}
    >
      <Animated.View style={[styles.pill, { opacity }]}>
        {type === "success" ? (
          <Ionicons
            name="checkmark-circle"
            size={22}
            color="#7CD296"
            style={styles.icon}
          />
        ) : null}
        <Text style={styles.text} numberOfLines={2}>
          {message}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "88%",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 28,
    backgroundColor: "rgba(40, 40, 40, 0.92)",
  },
  icon: {
    marginRight: 10,
  },
  text: {
    flexShrink: 1,
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
  },
});
