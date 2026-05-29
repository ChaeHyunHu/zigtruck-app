import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

import { appColors } from "@/src/constants/colors";
import {
  addMonths,
  formatYYYYMMDD,
  getCalendarGrid,
  isSameDay,
  parseYMD,
} from "@/src/features/drive/driveDateUtils";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

type Props = {
  visible: boolean;
  selectedYmd: string;
  onClose: () => void;
  onSelect: (ymd: string) => void;
};

/** 일지·주유비 폼용 달력 오버레이 (첫 번째 디자인) */
export function DriveDateCalendarPicker({
  visible,
  selectedYmd,
  onClose,
  onSelect,
}: Props) {
  const selectedDate = useMemo(() => parseYMD(selectedYmd), [selectedYmd]);
  const [month, setMonth] = useState(() => parseYMD(selectedYmd));
  const weeks = useMemo(() => getCalendarGrid(month), [month]);

  React.useEffect(() => {
    if (visible) setMonth(parseYMD(selectedYmd));
  }, [visible, selectedYmd]);

  const handleSelect = (date: Date) => {
    onSelect(formatYYYYMMDD(date));
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 items-center justify-center bg-black/40 px-6" onPress={onClose}>
        <Pressable
          className="w-full max-w-[360px] rounded-2xl bg-white px-4 pb-4 pt-3"
          onPress={(e) => e.stopPropagation()}
        >
          <View className="mb-3 flex-row items-center justify-center">
            <Pressable hitSlop={12} onPress={() => setMonth(addMonths(month, -1))}>
              <Ionicons name="chevron-back" size={22} color={appColors.gray800} />
            </Pressable>
            <Text className="mx-3 min-w-[100px] text-center text-[16px] font-semibold text-gray900">
              {`${month.getMonth() + 1}월 ${month.getFullYear()}`}
            </Text>
            <Pressable hitSlop={12} onPress={() => setMonth(addMonths(month, 1))}>
              <Ionicons name="chevron-forward" size={22} color={appColors.gray800} />
            </Pressable>
          </View>

          <View className="mb-2 flex-row">
            {WEEKDAYS.map((label, i) => (
              <View key={label} className="flex-1 items-center py-1">
                <Text
                  className={`text-[13px] font-medium ${
                    i === 0 ? "text-danger" : "text-gray700"
                  }`}
                >
                  {label}
                </Text>
              </View>
            ))}
          </View>

          {weeks.map((week, weekIndex) => (
            <View key={`week-${weekIndex}`} className="flex-row">
              {week.map((date, dayIndex) => {
                if (!date) {
                  return <View key={`e-${dayIndex}`} className="h-10 flex-1" />;
                }
                const isSelected = isSameDay(date, selectedDate);
                const isSunday = date.getDay() === 0;
                return (
                  <Pressable
                    key={formatYYYYMMDD(date)}
                    className="h-10 flex-1 items-center justify-center"
                    onPress={() => handleSelect(date)}
                  >
                    <View
                      className={`h-8 w-8 items-center justify-center rounded-full ${
                        isSelected ? "bg-primary" : ""
                      }`}
                    >
                      <Text
                        className={`text-[15px] ${
                          isSelected
                            ? "font-bold text-white"
                            : isSunday
                              ? "text-danger"
                              : "text-gray900"
                        }`}
                      >
                        {date.getDate()}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}

          <Pressable
            onPress={onClose}
            className="mt-4 items-center rounded-lg bg-primary py-3"
          >
            <Text className="text-[16px] font-bold text-white">닫기</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
