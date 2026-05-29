import React from "react";
import { View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
  type Edge,
} from "react-native-safe-area-context";

import { useAppSafeAreaInsets } from "@/src/hooks/useAppSafeAreaInsets";

type ScreenVariant = "tab" | "stack";

type ScreenProps = {
  children: React.ReactNode;
  className?: string;
  variant?: ScreenVariant;
  /** 지정 시 SafeAreaView edges를 직접 제어 (기본: 상·하단 시스템 영역 회피) */
  edges?: Edge[];
};

/** 탭 화면은 하단 탭바가 추가로 safe area를 처리하므로 상단만 */
const VARIANT_EDGES: Record<ScreenVariant, Edge[]> = {
  tab: ["top"],
  stack: ["top", "bottom"],
};

export function Screen({
  children,
  className = "flex-1 bg-white",
  variant = "stack",
  edges,
}: ScreenProps) {
  const rawInsets = useSafeAreaInsets();
  const insets = useAppSafeAreaInsets();
  const resolvedEdges = edges ?? VARIANT_EDGES[variant];
  /** Android 등에서 native bottom inset이 0일 때 시스템 네비와 겹치지 않게 보정 */
  const extraBottom = resolvedEdges.includes("bottom")
    ? Math.max(0, insets.bottom - rawInsets.bottom)
    : 0;

  return (
    <SafeAreaView className={className} edges={resolvedEdges}>
      {extraBottom > 0 ? (
        <View style={{ flex: 1, paddingBottom: extraBottom }}>{children}</View>
      ) : (
        children
      )}
    </SafeAreaView>
  );
}
