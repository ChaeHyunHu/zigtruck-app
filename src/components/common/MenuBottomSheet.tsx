import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { appColors } from "@/src/constants/colors";
import { useAppSafeAreaInsets } from "@/src/hooks/useAppSafeAreaInsets";

export type MenuBottomSheetItem = {
  label: string;
  onPress: () => void;
};

type MenuBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  items: MenuBottomSheetItem[];
  /** @deprecated 더 이상 사용하지 않음 (항상 검증된 Modal 패턴으로 렌더) */
  noModal?: boolean;
  /** @deprecated */
  overlayZIndex?: number;
};

const SCREEN_HEIGHT = Dimensions.get("window").height;
const HEADER_HEIGHT = 56;
const ROW_HEIGHT = 57;
/** 모달이 뜬 직후 터치 업 이벤트가 backdrop으로 전달돼 즉시 닫히는 현상 방지 */
const BACKDROP_READY_MS = 350;
/** 닫힘 애니메이션 이후 네비게이션 — 잔여 Modal이 새 화면 터치를 막지 않게 */
const NAVIGATE_AFTER_CLOSE_MS = 280;

/**
 * 메뉴 바텀시트. 내차관리 상태변경 시트(ProductEditOptionSheet)와 동일한
 * 자체 Modal + useEffect 애니메이션 + absolute bottom 패턴을 사용한다.
 * (AnimatedBottomSheetModal의 useLayoutEffect/flex 방식이 Android에서 시트가
 *  올라오지 않는 문제를 회피)
 */
export function MenuBottomSheet({
  visible,
  onClose,
  title = "메뉴",
  items,
}: MenuBottomSheetProps) {
  const insets = useAppSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 12);

  const maxHeight = Math.round(SCREEN_HEIGHT * 0.75);
  const contentHeight = HEADER_HEIGHT + items.length * ROW_HEIGHT + bottomPadding;
  const sheetHeight = Math.min(contentHeight, maxHeight);

  const translateY = useRef(new Animated.Value(sheetHeight)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const backdropReadyRef = useRef(false);
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) setMounted(true);
  }, [visible]);

  useEffect(() => {
    if (!mounted) return;

    if (visible) {
      backdropReadyRef.current = false;
      translateY.setValue(sheetHeight);
      backdropOpacity.setValue(0);
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        backdropReadyRef.current = true;
      }, BACKDROP_READY_MS);
      return () => clearTimeout(timer);
    }

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: sheetHeight,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setMounted(false);
    });
  }, [visible, mounted, sheetHeight, translateY, backdropOpacity]);

  const handleBackdropPress = () => {
    if (!backdropReadyRef.current) return;
    onClose();
  };

  const handleItemPress = (onPress: () => void) => {
    onClose();
    setTimeout(onPress, NAVIGATE_AFTER_CLOSE_MS);
  };

  if (!mounted) return null;

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={handleBackdropPress}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              height: sheetHeight,
              paddingBottom: bottomPadding,
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={8} style={styles.closeButton}>
              <Ionicons name="close" size={22} color="#414141" />
            </Pressable>
          </View>

          {items.map((item, index) => (
            <Pressable
              key={`${item.label}-${index}`}
              style={styles.row}
              onPress={() => handleItemPress(item.onPress)}
            >
              <Text style={styles.rowText}>{item.label}</Text>
            </Pressable>
          ))}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  header: {
    height: HEADER_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: appColors.gray900,
  },
  closeButton: {
    position: "absolute",
    right: 16,
  },
  row: {
    height: ROW_HEIGHT,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: appColors.gray200,
  },
  rowText: {
    fontSize: 16,
    fontWeight: "600",
    color: appColors.gray900,
  },
});
