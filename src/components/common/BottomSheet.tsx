import { Ionicons } from "@expo/vector-icons";
import React, { forwardRef } from "react";
import { Pressable, Text, View, type ViewStyle } from "react-native";

import {
  AnimatedBottomSheetModal,
  type AnimatedBottomSheetModalRef,
  getDefaultBottomSheetHeight,
} from "@/src/components/common/AnimatedBottomSheetModal";

export type BottomSheetRef = AnimatedBottomSheetModalRef;
export { getDefaultBottomSheetHeight };

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** 직접 지정 시 heightRatio보다 우선 */
  sheetHeight?: number;
  /** sheetHeight 미지정 시 화면 높이 비율 (기본 0.88) */
  heightRatio?: number;
  topDismissArea?: boolean;
  /** 상태바·배경 헤더가 가리지 않도록 시트 위 최소 여백 */
  minTopInset?: number;
  sheetStyle?: ViewStyle;
  /**
   * hug: 콘텐츠 높이에 맞춤 (메뉴·정렬 등 — 시트 하단 빈 공백 방지)
   * fill: sheetHeight 전체를 채움 (스크롤 목록 등)
   */
  contentLayout?: "fill" | "hug";
  /** false면 시트의 backdrop dim을 그리지 않음 (시트 누적 시 아래 시트는 끔) */
  showBackdrop?: boolean;
  /** true면 RN Modal로 감싸지 않고 부모 컨테이너 안에 absoluteFill로 렌더 */
  noModal?: boolean;
  /** noModal stacking 시 z-index */
  overlayZIndex?: number;
  /** 시트 Modal 안 root 위에 absolute로 그려질 오버레이 (튜토리얼 spotlight 등) */
  tutorialOverlay?: React.ReactNode;
};

/**
 * 바텀시트 공통 컴포넌트.
 * 배경 딤은 먼저 페이드인되고, 시트는 이후 슬라이드업 됩니다.
 * (구매동행서비스 등 AnimatedBottomSheetModal과 동일한 동작)
 */
export const BottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(
  function BottomSheet(
    {
      visible,
      onClose,
      children,
      sheetHeight,
      heightRatio = 0.88,
      topDismissArea = true,
      minTopInset = 0,
      sheetStyle,
      contentLayout = "fill",
      showBackdrop = true,
      noModal = false,
      overlayZIndex,
      tutorialOverlay,
    },
    ref,
  ) {
    const resolvedHeight =
      sheetHeight ?? getDefaultBottomSheetHeight(heightRatio, minTopInset || 56);

    const body =
      contentLayout === "hug" ? (
        children
      ) : (
        <View style={{ flex: 1, backgroundColor: "#ffffff" }}>{children}</View>
      );

    return (
      <AnimatedBottomSheetModal
        ref={ref}
        visible={visible}
        onClose={onClose}
        sheetHeight={resolvedHeight}
        topDismissArea={topDismissArea}
        minTopInset={minTopInset}
        sheetStyle={[{ backgroundColor: "#ffffff" }, sheetStyle]}
        showBackdrop={showBackdrop}
        noModal={noModal}
        overlayZIndex={overlayZIndex}
        tutorialOverlay={tutorialOverlay}
      >
        {body}
      </AnimatedBottomSheetModal>
    );
  },
);

type BottomSheetHeaderProps = {
  title: string;
  onClose: () => void;
  bordered?: boolean;
  dense?: boolean;
};

export function BottomSheetHeader({
  title,
  onClose,
  bordered = true,
  dense = false,
}: BottomSheetHeaderProps) {
  return (
    <View
      className={`flex-row items-center justify-center px-4 ${dense ? "py-3" : "py-4"} ${
        bordered ? "border-b border-gray200" : ""
      }`}
    >
      <Text className="text-[16px] font-bold text-gray900">{title}</Text>
      <Pressable onPress={onClose} hitSlop={8} className="absolute right-4">
        <Ionicons name="close" size={22} color="#414141" />
      </Pressable>
    </View>
  );
}
