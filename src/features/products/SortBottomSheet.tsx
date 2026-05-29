import React from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomSheet, BottomSheetHeader } from "@/src/components/common/BottomSheet";
import { QUICK_SORT_OPTIONS } from "@/src/constants/products";

type Props = {
  visible: boolean;
  selectedSort: string;
  onClose: () => void;
  onSelect: (sort: string) => void;
};

const HEADER_HEIGHT = 56;
const OPTION_HEIGHT = 56;

export function SortBottomSheet({
  visible,
  selectedSort,
  onClose,
  onSelect,
}: Props) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 12);
  const sheetHeight =
    HEADER_HEIGHT +
    QUICK_SORT_OPTIONS.length * OPTION_HEIGHT +
    bottomPadding;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      sheetHeight={sheetHeight}
      contentLayout="hug"
    >
      <View className="bg-white px-4" style={{ paddingBottom: bottomPadding }}>
        <BottomSheetHeader title="정렬" onClose={onClose} bordered={false} />

        {QUICK_SORT_OPTIONS.map((option) => {
          const isActive = selectedSort === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => {
                onSelect(option.value);
                onClose();
              }}
              className="py-4"
            >
              <Text
                className={`text-[15px] ${
                  isActive
                    ? "font-bold text-gray900"
                    : "font-medium text-gray800"
                }`}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </BottomSheet>
  );
}
