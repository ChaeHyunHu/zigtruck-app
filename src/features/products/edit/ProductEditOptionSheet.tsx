import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { appColors } from "@/src/constants/colors";
import type { OptionItem } from "@/src/features/sell-car/registration/OptionPickerSheet";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const HEADER_HEIGHT = 57;
const ROW_HEIGHT = 57;
/** 모달이 뜬 직후 터치 업 이벤트가 backdrop으로 전달돼 즉시 닫히는 현상 방지 */
const BACKDROP_READY_MS = 350;

type Props = {
  visible: boolean;
  title: string;
  options: OptionItem[];
  selectedCode?: string;
  onClose: () => void;
  onSelect: (item: OptionItem) => void;
};

export function ProductEditOptionSheet({
  visible,
  title,
  options,
  selectedCode,
  onClose,
  onSelect,
}: Props) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 12);

  const maxHeight = Math.round(SCREEN_HEIGHT * 0.75);
  const contentHeight = HEADER_HEIGHT + options.length * ROW_HEIGHT + bottomPadding;
  const sheetHeight = Math.min(contentHeight, maxHeight);
  const scrollable = contentHeight > maxHeight;
  const scrollMaxHeight = sheetHeight - HEADER_HEIGHT - bottomPadding;

  const translateY = useRef(new Animated.Value(sheetHeight)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const backdropReadyRef = useRef(false);
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
    }
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
        <Animated.View
          style={[styles.backdrop, { opacity: backdropOpacity }]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={handleBackdropPress} />
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

          {scrollable ? (
            <ScrollView style={{ maxHeight: scrollMaxHeight }}>
              {options.map((item) => (
                <OptionRow
                  key={item.code}
                  item={item}
                  selected={item.code === selectedCode}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                />
              ))}
            </ScrollView>
          ) : (
            options.map((item) => (
              <OptionRow
                key={item.code}
                item={item}
                selected={item.code === selectedCode}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              />
            ))
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

function OptionRow({
  item,
  selected,
  onPress,
}: {
  item: OptionItem;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Text
        style={[styles.rowText, selected ? styles.rowTextSelected : undefined]}
      >
        {item.desc}
      </Text>
      {selected ? (
        <Ionicons name="checkmark" size={20} color={appColors.primary} />
      ) : null}
    </Pressable>
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
    borderBottomWidth: 1,
    borderBottomColor: appColors.gray200,
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: appColors.gray200,
  },
  rowText: {
    fontSize: 16,
    color: appColors.gray800,
  },
  rowTextSelected: {
    fontWeight: "700",
    color: appColors.primary,
  },
});
