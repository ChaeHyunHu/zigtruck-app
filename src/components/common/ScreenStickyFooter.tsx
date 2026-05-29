import React from "react";
import { View, type ViewProps } from "react-native";

import { useAppSafeAreaInsets } from "@/src/hooks/useAppSafeAreaInsets";

type ScreenStickyFooterProps = ViewProps & {
  children: React.ReactNode;
};

/** 화면 하단 고정 푸터 — 시스템 네비게이션 위에 버튼이 오도록 safe area 반영 */
export function ScreenStickyFooter({
  children,
  className = "",
  style,
  ...rest
}: ScreenStickyFooterProps) {
  const insets = useAppSafeAreaInsets();

  return (
    <View
      className={`absolute bottom-0 left-0 right-0 border-t border-gray300 bg-white ${className}`}
      style={[{ paddingBottom: Math.max(insets.bottom, 12) }, style]}
      {...rest}
    >
      {children}
    </View>
  );
}
