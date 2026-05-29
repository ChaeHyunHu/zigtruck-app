import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BottomSheet,
  BottomSheetHeader,
  getDefaultBottomSheetHeight,
} from "@/src/components/common/BottomSheet";
import { appColors } from "@/src/constants/colors";

import type { FilterOptionItem } from "./filterTypes";

type Props = {
  visible: boolean;
  title: string;
  options: FilterOptionItem[];
  selectedCodes: string[];
  onClose: () => void;
  onApply: (codes: string[]) => void;
  showCount?: boolean;
};

const SHEET_HEIGHT = getDefaultBottomSheetHeight(0.78);

export function FilterOptionSheet({
  visible,
  title,
  options,
  selectedCodes,
  onClose,
  onApply,
  showCount = true,
}: Props) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<string[]>(selectedCodes);

  useEffect(() => {
    if (visible) setDraft(selectedCodes);
  }, [selectedCodes, visible]);

  const toggleCode = (code: string) => {
    setDraft((prev) =>
      prev.includes(code)
        ? prev.filter((item) => item !== code)
        : [...prev, code],
    );
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} sheetHeight={SHEET_HEIGHT}>
      <View className="flex-1 bg-white">
        <BottomSheetHeader title={title} onClose={onClose} />

        <FlatList
          data={options}
          keyExtractor={(item) => item.code}
          style={{ flex: 1 }}
          renderItem={({ item }) => {
            const isActive = draft.includes(item.code);
            return (
              <Pressable
                onPress={() => toggleCode(item.code)}
                className="flex-row items-center px-4 py-4"
              >
                {isActive ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color={appColors.primary}
                  />
                ) : (
                  <Ionicons
                    name="ellipse-outline"
                    size={22}
                    color={appColors.gray300}
                  />
                )}
                <Text className="ml-3 flex-1 text-[15px] text-gray900">
                  {item.label}
                </Text>
                {showCount && item.count !== undefined ? (
                  <Text className="text-[14px] text-gray500">
                    {item.count.toLocaleString("ko-KR")}
                  </Text>
                ) : null}
              </Pressable>
            );
          }}
        />

        <View
          className="px-4 pt-2"
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
        >
          <Pressable
            onPress={() => onApply(draft)}
            className="items-center justify-center rounded-[8px] bg-primary py-3.5"
          >
            <Text className="text-[15px] font-bold text-white">적용</Text>
          </Pressable>
        </View>
      </View>
    </BottomSheet>
  );
}
