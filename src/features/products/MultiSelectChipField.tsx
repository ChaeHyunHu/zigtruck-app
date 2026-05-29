import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import type { FilterOptionItem } from "@/src/features/products/filterTypes";

type MultiSelectChipFieldProps = {
  placeholder: string;
  options: FilterOptionItem[];
  codes: string[];
  onRemove: (code: string) => void;
  onOpen: () => void;
};

const CHIP_GAP = 6;
const OVERFLOW_BADGE_RESERVED_WIDTH = 56;

export function MultiSelectChipField({
  placeholder,
  options,
  codes,
  onRemove,
  onOpen,
}: MultiSelectChipFieldProps) {
  const items = codes
    .map((code) => options.find((option) => option.code === code))
    .filter((item): item is FilterOptionItem => Boolean(item));

  const [containerWidth, setContainerWidth] = useState(0);
  const [chipWidths, setChipWidths] = useState<Record<string, number>>({});

  const codesKey = items.map((item) => item.code).join("|");
  useEffect(() => {
    setChipWidths((prev) => {
      const next: Record<string, number> = {};
      for (const item of items) {
        if (prev[item.code] !== undefined) {
          next[item.code] = prev[item.code];
        }
      }
      return next;
    });
  }, [codesKey]);

  const allMeasured =
    items.length === 0 ||
    items.every((item) => chipWidths[item.code] !== undefined);

  let visibleCount = items.length;
  if (allMeasured && containerWidth > 0 && items.length > 0) {
    visibleCount = 0;
    let used = 0;
    for (let i = 0; i < items.length; i += 1) {
      const chipWidth = chipWidths[items[i].code];
      const needed = chipWidth + (i > 0 ? CHIP_GAP : 0);
      const moreAfter = i + 1 < items.length;
      const reserve = moreAfter ? OVERFLOW_BADGE_RESERVED_WIDTH + CHIP_GAP : 0;
      if (used + needed + reserve > containerWidth) break;
      used += needed;
      visibleCount += 1;
    }
    if (visibleCount === 0) visibleCount = 1;
  }

  const visibleItems = items.slice(0, visibleCount);
  const hiddenCount = items.length - visibleItems.length;
  const itemsToMeasure = items.filter(
    (item) => chipWidths[item.code] === undefined,
  );

  return (
    <Pressable
      onPress={onOpen}
      className="flex-row items-center rounded-[8px] border border-gray300 px-3 py-2.5"
    >
      <View
        className="flex-1 flex-row items-center"
        onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
      >
        {items.length === 0 ? (
          <Text className="py-1 text-[14px] text-gray500">{placeholder}</Text>
        ) : (
          <>
            {visibleItems.map((item, idx) => (
              <View
                key={item.code}
                style={idx > 0 ? { marginLeft: CHIP_GAP } : undefined}
                className="flex-row items-center rounded-full bg-gray100 px-3 py-1"
              >
                <Text className="text-[13px] text-gray900">{item.label}</Text>
                <Pressable
                  onPress={(event) => {
                    event.stopPropagation();
                    onRemove(item.code);
                  }}
                  hitSlop={6}
                  className="ml-1.5"
                >
                  <Ionicons name="close" size={14} color="#737373" />
                </Pressable>
              </View>
            ))}
            {hiddenCount > 0 ? (
              <View
                style={{ marginLeft: CHIP_GAP }}
                className="flex-row items-center"
              >
                <Text className="mr-1 text-[14px] text-gray500">···</Text>
                <View className="items-center justify-center rounded-full bg-gray200 px-2 py-0.5">
                  <Text className="text-[12px] font-medium text-gray700">
                    {hiddenCount}
                  </Text>
                </View>
              </View>
            ) : null}
          </>
        )}

        {itemsToMeasure.length > 0 ? (
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: -9999,
              left: 0,
              opacity: 0,
              flexDirection: "row",
            }}
          >
            {itemsToMeasure.map((item) => (
              <View
                key={`measure-${item.code}`}
                onLayout={(event) => {
                  const width = event.nativeEvent.layout.width;
                  setChipWidths((prev) =>
                    prev[item.code] === width
                      ? prev
                      : { ...prev, [item.code]: width },
                  );
                }}
                className="flex-row items-center rounded-full bg-gray100 px-3 py-1"
              >
                <Text className="text-[13px] text-gray900">{item.label}</Text>
                <View className="ml-1.5">
                  <Ionicons name="close" size={14} color="#737373" />
                </View>
              </View>
            ))}
          </View>
        ) : null}
      </View>
      <Ionicons name="chevron-down" size={16} color="#919191" />
    </Pressable>
  );
}
