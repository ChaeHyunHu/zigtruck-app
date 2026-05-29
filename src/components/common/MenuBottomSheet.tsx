import React, { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { useAppSafeAreaInsets } from "@/src/hooks/useAppSafeAreaInsets";

import {
  BottomSheet,
  BottomSheetHeader,
} from "@/src/components/common/BottomSheet";

export type MenuBottomSheetItem = {
  label: string;
  onPress: () => void;
};

type MenuBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  items: MenuBottomSheetItem[];
};

const HEADER_HEIGHT = 56;
const ITEM_HEIGHT = 57;
/** BottomSheet 닫힘 애니메이션(280ms) 이후 네비게이션 — 잔여 Modal이 새 화면 터치를 막지 않게 */
const NAVIGATE_AFTER_CLOSE_MS = 320;

export function MenuBottomSheet({
  visible,
  onClose,
  title = "메뉴",
  items,
}: MenuBottomSheetProps) {
  const insets = useAppSafeAreaInsets();

  const bottomPadding = Math.max(insets.bottom, 12);

  const sheetHeight = useMemo(
    () => HEADER_HEIGHT + items.length * ITEM_HEIGHT + bottomPadding,
    [items.length, bottomPadding],
  );

  const handlePress = (onPress: () => void) => {
    onClose();
    setTimeout(onPress, NAVIGATE_AFTER_CLOSE_MS);
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      sheetHeight={sheetHeight}
      contentLayout="hug"
    >
      <View className="bg-white" style={{ paddingBottom: bottomPadding }}>
        <BottomSheetHeader title={title} onClose={onClose} bordered={false} />
        {items.map((item, index) => (
          <Pressable
            key={`${item.label}-${index}`}
            onPress={() => handlePress(item.onPress)}
            className={`px-4 py-4 ${index === 0 ? "border-t border-gray200" : "border-t border-gray200"}`}
          >
            <Text className="text-[16px] font-semibold text-gray900">
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </BottomSheet>
  );
}
