import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BottomSheet,
  BottomSheetHeader,
} from "@/src/components/common/BottomSheet";
import { getOptionPickerSheetLayout } from "@/src/components/common/optionPickerSheetLayout";
import { appColors } from "@/src/constants/colors";

export type OptionItem = { code: string; desc: string };

type OptionPickerSheetProps = {
  visible: boolean;
  title: string;
  options: OptionItem[];
  selectedCode?: string;
  onClose: () => void;
  onSelect: (item: OptionItem) => void;
  /** Stack 화면에서 RN Modal이 안 뜨는 경우 부모 flex 컨테이너 안에 오버레이로 렌더 */
  noModal?: boolean;
  overlayZIndex?: number;
};

export const OptionPickerSheet = React.memo(function OptionPickerSheet({
  visible,
  title,
  options,
  selectedCode,
  onClose,
  onSelect,
  noModal = false,
  overlayZIndex,
}: OptionPickerSheetProps) {
  const insets = useSafeAreaInsets();

  const { sheetHeight, bottomPadding, scrollable, scrollMaxHeight } = useMemo(
    () => getOptionPickerSheetLayout(options.length, insets.bottom),
    [options.length, insets.bottom],
  );

  const rows = options.map((item) => {
    const selected = item.code === selectedCode;
    return (
      <Pressable
        key={item.code}
        className="flex-row items-center justify-between border-b border-gray200 px-4 py-4"
        onPress={() => {
          onSelect(item);
          onClose();
        }}
      >
        <Text
          className={`text-[16px] ${selected ? "font-bold text-primary" : "text-gray800"}`}
        >
          {item.desc}
        </Text>
        {selected ? (
          <Ionicons name="checkmark" size={20} color={appColors.primary} />
        ) : null}
      </Pressable>
    );
  });

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      sheetHeight={sheetHeight}
      contentLayout={scrollable ? "fill" : "hug"}
      noModal={noModal}
      overlayZIndex={overlayZIndex}
    >
      <View
        className="bg-white"
        style={
          scrollable
            ? { flex: 1, paddingBottom: bottomPadding }
            : { paddingBottom: bottomPadding }
        }
      >
        <BottomSheetHeader title={title} onClose={onClose} bordered />
        {scrollable ? (
          <ScrollView style={{ maxHeight: scrollMaxHeight }}>{rows}</ScrollView>
        ) : (
          rows
        )}
      </View>
    </BottomSheet>
  );
});
