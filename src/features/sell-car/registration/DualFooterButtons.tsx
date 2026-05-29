import React from "react";
import { Pressable, Text, View } from "react-native";

import { appColors } from "@/src/constants/colors";
import { useAppSafeAreaInsets } from "@/src/hooks/useAppSafeAreaInsets";

type DualFooterButtonsProps = {
  leftLabel?: string;
  rightLabel: string;
  onPressLeft?: () => void;
  onPressRight: () => void;
  rightDisabled?: boolean;
  loading?: boolean;
  /** 우측 CTA 배경색 (미지정 시 primary) */
  rightButtonColor?: string;
  /** 좌측 버튼 flex 비율 (기본 1, 검색 화면 등은 0.35) */
  leftFlex?: number;
  /** false: 바텀시트 등 부모가 하단 safe area를 이미 처리한 경우 */
  safeAreaBottom?: boolean;
};

export const DualFooterButtons = React.memo(function DualFooterButtons({
  leftLabel = "이전",
  rightLabel,
  onPressLeft,
  onPressRight,
  rightDisabled,
  loading,
  rightButtonColor,
  leftFlex = 1,
  safeAreaBottom = true,
}: DualFooterButtonsProps) {
  const insets = useAppSafeAreaInsets();
  const paddingBottom = safeAreaBottom ? Math.max(insets.bottom, 12) : 16;

  return (
    <View
      className="flex-row gap-2 border-t border-gray300 bg-white px-4 pt-3"
      style={{ paddingBottom }}
    >
      {onPressLeft ? (
        <Pressable
          className="h-12 items-center justify-center rounded-lg border border-gray300 bg-white"
          style={{ flex: leftFlex }}
          onPress={onPressLeft}
        >
          <Text className="text-[16px] font-bold text-gray800">{leftLabel}</Text>
        </Pressable>
      ) : null}
      <Pressable
        className="h-12 items-center justify-center rounded-lg"
        style={{
          flex: onPressLeft ? 1 : 1,
          backgroundColor: rightDisabled
            ? appColors.gray400
            : (rightButtonColor ?? appColors.primary),
        }}
        disabled={rightDisabled || loading}
        onPress={onPressRight}
      >
        <Text className="text-[16px] font-bold text-white">
          {loading ? "저장 중..." : rightLabel}
        </Text>
      </Pressable>
    </View>
  );
});
