import { useAppSafeAreaInsets } from "@/src/hooks/useAppSafeAreaInsets";

import { TAB_BAR_BASE_HEIGHT } from "@/src/constants/layout";

export function useScreenInsets() {
  const insets = useAppSafeAreaInsets();

  return {
    top: insets.top,
    bottom: insets.bottom,
    left: insets.left,
    right: insets.right,
    tabBarHeight: TAB_BAR_BASE_HEIGHT + insets.bottom,
    listPaddingBottom: 24,
    fabListPaddingBottom: 88,
    stackFooterPadding: Math.max(insets.bottom, 12),
    scrollBottomPadding: 96 + Math.max(insets.bottom, 12),
  };
}
