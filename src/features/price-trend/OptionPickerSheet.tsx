import React, { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BottomSheet,
  BottomSheetHeader,
} from "@/src/components/common/BottomSheet";
import { getOptionPickerSheetLayout } from "@/src/components/common/optionPickerSheetLayout";

export type PickerOption = {
  id?: number | string;
  code?: string;
  desc?: string;
  name?: string;
};

type OptionPickerSheetProps = {
  visible: boolean;
  title: string;
  options: PickerOption[];
  onClose: () => void;
  onSelect: (option: PickerOption) => void;
  /** Stack 화면에서 RN Modal이 안 뜨는 경우 부모 flex 컨테이너 안에 오버레이로 렌더 */
  noModal?: boolean;
  overlayZIndex?: number;
};

export function OptionPickerSheet({
  visible,
  title,
  options,
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

  const rows = options.map((option) => {
    const label =
      option.desc ?? option.name ?? String(option.code ?? option.id ?? "");
    const key = String(option.id ?? option.code ?? label);
    return (
      <Pressable
        key={key}
        className="border-b border-gray200 px-4 py-4"
        onPress={() => {
          onSelect(option);
          onClose();
        }}
      >
        <Text className="text-[15px] text-gray900">{label}</Text>
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
}
