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
import type { FilterOption } from "@/src/features/drive/otherExpenseFilterUtils";
import { toggleFilterOption } from "@/src/features/drive/otherExpenseFilterUtils";

type Props = {
  visible: boolean;
  title: string;
  options: FilterOption[];
  selected: FilterOption[];
  onClose: () => void;
  onChange: (selected: FilterOption[]) => void;
};

export function OtherExpenseCategoryFilterPickerSheet({
  visible,
  title,
  options,
  selected,
  onClose,
  onChange,
}: Props) {
  const insets = useSafeAreaInsets();
  const { sheetHeight, bottomPadding, scrollable, scrollMaxHeight } = useMemo(
    () => getOptionPickerSheetLayout(options.length, insets.bottom),
    [options.length, insets.bottom],
  );

  const isChecked = (item: FilterOption) =>
    selected.some((o) => o.code === item.code);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      sheetHeight={sheetHeight}
      contentLayout={scrollable ? "fill" : "hug"}
      noModal
      overlayZIndex={1002}
    >
      <View
        className="bg-white"
        style={
          scrollable
            ? { flex: 1, paddingBottom: bottomPadding }
            : { paddingBottom: bottomPadding }
        }
      >
        <BottomSheetHeader title={title} onClose={onClose} />
        {scrollable ? (
          <ScrollView style={{ maxHeight: scrollMaxHeight }}>
            {options.map((item) => (
              <FilterRow
                key={item.code}
                item={item}
                checked={isChecked(item)}
                onPress={() =>
                  onChange(toggleFilterOption(selected, options, item))
                }
              />
            ))}
          </ScrollView>
        ) : (
          options.map((item) => (
            <FilterRow
              key={item.code}
              item={item}
              checked={isChecked(item)}
              onPress={() =>
                onChange(toggleFilterOption(selected, options, item))
              }
            />
          ))
        )}
      </View>
    </BottomSheet>
  );
}

function FilterRow({
  item,
  checked,
  onPress,
}: {
  item: FilterOption;
  checked: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center border-b border-gray200 px-4 py-4"
    >
      <Ionicons
        name={checked ? "checkmark-circle" : "ellipse-outline"}
        size={22}
        color={checked ? appColors.primary : appColors.gray500}
      />
      <Text
        className={`ml-3 text-[16px] ${checked ? "font-bold text-primary" : "text-gray800"}`}
      >
        {item.desc}
      </Text>
    </Pressable>
  );
}
