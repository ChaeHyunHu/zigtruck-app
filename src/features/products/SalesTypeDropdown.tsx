import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { appColors } from "@/src/constants/colors";
import { SALES_TYPE_FILTER_OPTIONS } from "@/src/constants/products";

type Props = {
  value?: string;
  onChange: (salesType?: string) => void;
};

export function SalesTypeDropdown({ value, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLabel = useMemo(() => {
    return (
      SALES_TYPE_FILTER_OPTIONS.find((option) => option.value === value)
        ?.label ?? "전체차량"
    );
  }, [value]);

  const onSelect = useCallback(
    (next?: string) => {
      onChange(next);
      setIsOpen(false);
    },
    [onChange],
  );

  return (
    <View className="relative z-10">
      <Pressable
        onPress={() => setIsOpen((prev) => !prev)}
        className="flex-row items-center rounded-[8px] border bg-white px-3 py-1.5"
        style={{
          borderColor: isOpen ? appColors.primary : appColors.gray300,
        }}
      >
        <Text className="text-[13px] font-semibold text-gray800">
          {selectedLabel}
        </Text>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={14}
          color="#414141"
          style={{ marginLeft: 4 }}
        />
      </Pressable>

      {isOpen ? (
        <View
          className="absolute left-0 top-[calc(100%+4px)] z-20 min-w-[148px] overflow-hidden rounded-[8px] border border-gray300 bg-white"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          {SALES_TYPE_FILTER_OPTIONS.map((option) => {
            const isActive =
              (option.value ?? undefined) === (value ?? undefined);
            return (
              <Pressable
                key={option.label}
                onPress={() => onSelect(option.value)}
                className="px-3 py-2.5"
                style={{
                  backgroundColor: isActive ? "#E8F0FF" : appColors.white,
                }}
              >
                <Text
                  className={`text-[13px] ${
                    isActive
                      ? "font-semibold text-gray900"
                      : "font-medium text-gray800"
                  }`}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
