import { useMemo } from "react";
import { Platform, StatusBar } from "react-native";
import { useAppSafeAreaInsets } from "@/src/hooks/useAppSafeAreaInsets";

import { getDefaultBottomSheetHeight } from "@/src/components/common/AnimatedBottomSheetModal";

/** RegistrationHeader 높이 (h-[52px]) */
export const DRIVE_SCREEN_HEADER_HEIGHT = 52;

/** 헤더 아래 추가 여백 */
const EXTRA_TOP_GAP = 12;

/**
 * 상태바 + 운행일지 헤더가 바텀시트에 가리지 않도록 상단 예약 높이
 */
export function useDriveTopReserved() {
  const insets = useAppSafeAreaInsets();
  const statusBarHeight =
    Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) : 0;
  const safeTop = Math.max(insets.top, statusBarHeight);
  return safeTop + DRIVE_SCREEN_HEADER_HEIGHT + EXTRA_TOP_GAP;
}

const FOOTER_SAFE_PADDING = 12;

function getBottomInset(insets: { bottom: number }) {
  return Platform.OS === "android"
    ? Math.max(insets.bottom, 28)
    : Math.max(insets.bottom, 12);
}

function useSheetHeight(ratio: number, minTopGapOverride?: number) {
  const topReserved = useDriveTopReserved();
  const insets = useAppSafeAreaInsets();
  const bottomGap = getBottomInset(insets) + FOOTER_SAFE_PADDING;
  const gap = minTopGapOverride ?? topReserved;
  return useMemo(
    () => getDefaultBottomSheetHeight(ratio, gap, bottomGap),
    [ratio, gap, bottomGap],
  );
}

/** 바텀시트 저장 버튼 영역 하단 패딩 */
export function useDriveSheetFooterPadding() {
  const insets = useAppSafeAreaInsets();
  return getBottomInset(insets) + FOOTER_SAFE_PADDING;
}

export function useDriveLogSheetHeight() {
  return useSheetHeight(0.88);
}

export function useDriveFuelSheetHeight() {
  return useSheetHeight(0.86);
}

export function useDriveOtherExpenseSheetHeight() {
  return useSheetHeight(0.78);
}

export function useDriveAddressSheetHeight() {
  return useSheetHeight(0.9);
}

export function useDriveTransportSearchSheetHeight() {
  const topReserved = useDriveTopReserved();
  return useMemo(
    () => getDefaultBottomSheetHeight(0.55, topReserved + 40),
    [topReserved],
  );
}
