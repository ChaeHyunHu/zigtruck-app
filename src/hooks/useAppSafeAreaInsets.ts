import { useMemo } from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Android에서 insets.bottom이 0으로 나와 시스템 네비와 겹칠 때 쓰는 최소 하단 여백 */
const ANDROID_MIN_BOTTOM_INSET = 24;

/**
 * 시스템 네비게이션·홈 인디케이터와 UI가 겹치지 않도록 보정한 safe area.
 */
export function useAppSafeAreaInsets() {
  const insets = useSafeAreaInsets();

  return useMemo(
    () => ({
      ...insets,
      bottom:
        Platform.OS === "android"
          ? Math.max(insets.bottom, ANDROID_MIN_BOTTOM_INSET)
          : insets.bottom,
    }),
    [insets.bottom, insets.left, insets.right, insets.top],
  );
}
