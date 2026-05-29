import React from "react";
import { Pressable, StyleSheet } from "react-native";

type Props = {
  visible: boolean;
  onPress: () => void;
};

/**
 * 웹 DriveHome 고정 딤 레이어 (opacity-50, z-40)와 동일.
 * BottomSheetPopup은 isBackdrop={false} — 딤은 시트와 분리해 깜빡임 없음.
 */
export function DriveDaySheetBackdrop({ visible, onPress }: Props) {
  if (!visible) return null;

  return (
    <Pressable
      onPress={onPress}
      style={styles.backdrop}
      accessibilityRole="button"
      accessibilityLabel="닫기"
    />
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
    elevation: 1000,
  },
});
