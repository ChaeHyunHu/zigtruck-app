import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { DriveTutorialAnchor } from "@/src/features/drive/components/DriveTutorialAnchor";

import { appColors } from "@/src/constants/colors";
import {
  addMonths,
  formatYYYYMMDD,
  formatYYYYMMDot,
  getCalendarGrid,
  isSameDay,
} from "@/src/features/drive/driveDateUtils";
import type { IncomeHistoryDay } from "@/src/features/drive/types";
import { formatNumberWithComma } from "@/src/features/home/utils";

const TODAY_CIRCLE_BG = appColors.primary;
const SELECTED_CIRCLE_BG = "#E7EFFF";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

type Props = {
  month: Date;
  selectedDate: Date;
  dayData: IncomeHistoryDay[];
  onSelectDate: (date: Date) => void;
  onChangeMonth: (date: Date) => void;
};

function DriveCalendarInner({
  month,
  selectedDate,
  dayData,
  onSelectDate,
  onChangeMonth,
}: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const today = new Date();
  const weeks = useMemo(() => getCalendarGrid(month), [month]);

  const dayMap = useMemo(() => {
    const map = new Map<string, IncomeHistoryDay>();
    dayData.forEach((item) => {
      map.set(item.baseDay?.slice(0, 10) ?? "", item);
    });
    return map;
  }, [dayData]);

  return (
    <View className="bg-white px-4 pb-0 pt-2">
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Pressable
            hitSlop={12}
            onPress={() => onChangeMonth(addMonths(month, -1))}
          >
            <Ionicons name="chevron-back" size={22} color={appColors.gray800} />
          </Pressable>
          <Text className="mx-3 text-[16px] font-semibold text-gray900">
            {formatYYYYMMDot(month)}
          </Text>
          <Pressable
            hitSlop={12}
            onPress={() => onChangeMonth(addMonths(month, 1))}
          >
            <Ionicons
              name="chevron-forward"
              size={22}
              color={appColors.gray800}
            />
          </Pressable>
        </View>
        <Pressable hitSlop={8} onPress={() => setShowTooltip((v) => !v)}>
          <Ionicons
            name="information-circle-outline"
            size={22}
            color={appColors.gray600}
          />
        </Pressable>
      </View>

      {showTooltip ? (
        <View className="mb-3 rounded-lg bg-gray100 p-3">
          <Text className="text-[12px] leading-[18px] text-gray800">
            일자 하단 +금액은 매출(운송비+회차비)+유가보조금+기타수익, -금액은
            지출(주유비+기타지출+통행료)입니다.
          </Text>
        </View>
      ) : null}

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

      {weeks.map((week, weekIndex) => {
        const lastDayIndexInWeek = week.reduce<number>(
          (last, cell, index) => (cell ? index : last),
          -1,
        );

        return (
        <View key={`week-${weekIndex}`} className="flex-row">
          {week.map((date, dayIndex) => {
            const isTrailingPlaceholder =
              !date && dayIndex > lastDayIndexInWeek && lastDayIndexInWeek >= 0;

            if (!date) {
              return (
                <View
                  key={`empty-${dayIndex}`}
                  className={isTrailingPlaceholder ? "flex-1" : "h-[48px] flex-1"}
                />
              );
            }
            const key = formatYYYYMMDD(date);
            const entry = dayMap.get(key);
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, today);
            const isSunday = date.getDay() === 0;
            const isFuture = date > today;

            const dayTextClass = isToday
              ? ""
              : isSelected
                ? "font-bold text-gray900"
                : isFuture
                  ? "text-gray400"
                  : isSunday
                    ? "text-danger"
                    : "text-gray900";

            const dayCircleStyle =
              isToday || isSelected
                ? {
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    alignItems: "center" as const,
                    justifyContent: "center" as const,
                    backgroundColor: isToday
                      ? TODAY_CIRCLE_BG
                      : SELECTED_CIRCLE_BG,
                  }
                : undefined;

            const dayTextStyle = isToday
              ? { color: "#FFFFFF", fontWeight: "700" as const, fontSize: 14 }
              : undefined;

            const dayNumber = (
              <View
                className={
                  dayCircleStyle
                    ? undefined
                    : "h-8 w-8 items-center justify-center"
                }
                style={dayCircleStyle}
              >
                <Text
                  className={`text-[14px] leading-[18px] ${dayTextClass}`}
                  style={dayTextStyle}
                >
                  {date.getDate()}
                </Text>
              </View>
            );

            return (
              <Pressable
                key={key}
                collapsable={false}
                className="h-[48px] flex-1 items-center justify-start pt-0.5"
                onPress={() => onSelectDate(date)}
              >
                <View className="h-8 w-full items-center justify-center">
                  {isToday ? (
                    <DriveTutorialAnchor
                      step={0}
                      className="h-8 w-8 items-center justify-center"
                    >
                      {dayNumber}
                    </DriveTutorialAnchor>
                  ) : (
                    dayNumber
                  )}
                </View>
                <View className="h-[18px] w-full items-center justify-start px-0.5">
                  {entry && entry.sales > 0 ? (
                    <Text
                      className="text-[9px] leading-[10px] text-primary"
                      numberOfLines={1}
                    >
                      +{formatNumberWithComma(entry.sales)}
                    </Text>
                  ) : null}
                  {entry && entry.expense > 0 ? (
                    <Text
                      className="text-[9px] leading-[10px] text-gray800"
                      numberOfLines={1}
                    >
                      -{formatNumberWithComma(entry.expense)}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>
        );
      })}
    </View>
  );
}

export const DriveCalendar = React.memo(DriveCalendarInner);
