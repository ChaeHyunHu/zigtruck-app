import { Ionicons } from "@expo/vector-icons";
import React, { useState, type Ref } from "react";
import { Pressable, Text, View } from "react-native";

import { formatNumberWithComma } from "@/src/features/home/utils";
import type { IncomeHistoryMonth } from "@/src/features/drive/types";
import { formatMonthLabel } from "@/src/features/drive/driveDateUtils";

type Props = {
  month: Date;
  data: IncomeHistoryMonth | null | undefined;
  onPressOutstanding: () => void;
  onPressFuel: () => void;
  onPressOtherExpense: () => void;
  onPressOtherIncome: () => void;
  otherExpenseRef?: Ref<View>;
  className?: string;
  bottomInset?: number;
};

function StatRowButton({ label, onPress }: { label: string; onPress?: () => void }) {
  const content = (
    <View className="h-[34px] min-w-[48px] items-center justify-center rounded-lg bg-gray100 px-3">
      <Text className="text-[14px] font-semibold text-gray700">{label}</Text>
    </View>
  );
  if (!onPress) return content;
  return <Pressable onPress={onPress}>{content}</Pressable>;
}

export function DriveMonthStats({
  month,
  data,
  onPressOutstanding,
  onPressFuel,
  onPressOtherExpense,
  onPressOtherIncome,
  otherExpenseRef,
  className = "",
  bottomInset = 0,
}: Props) {
  const [incomeOpen, setIncomeOpen] = useState(false);

  const income = data?.income ?? 0;
  const sales = data?.sales ?? 0;
  const expense = data?.expense ?? 0;
  const subsidy = data?.subsidyForFuel ?? 0;

  return (
    <View
      className={`bg-gray100 px-4 pt-4 ${className}`.trim()}
      style={{ paddingBottom: bottomInset }}
    >
      <Text className="text-[14px] font-medium text-gray800">
        {formatMonthLabel(month)} 통계
      </Text>

      <View className="mt-2.5 rounded-lg bg-white p-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 flex-row flex-wrap items-center gap-1">
            <Ionicons name="cash" size={20} color="#FFDC5F" />
            <Text className="text-[14px] font-medium text-gray800">수익</Text>
            <Text className="text-[18px] font-semibold text-gray900">
              {formatNumberWithComma(income)}원
            </Text>
          </View>
          <StatRowButton
            label={incomeOpen ? "접기" : "보기"}
            onPress={() => setIncomeOpen((v) => !v)}
          />
        </View>
        {incomeOpen ? (
          <View className="mt-4 gap-2.5 border-t border-gray300 pt-3">
            <View className="flex-row justify-between">
              <Text className="text-[14px] text-gray700">매출</Text>
              <Text className="text-[14px] font-medium text-gray900">
                +{formatNumberWithComma(sales)}원
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-[14px] text-gray700">지출</Text>
              <Text className="text-[14px] font-medium text-gray700">
                -{formatNumberWithComma(expense)}원
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-[14px] text-gray700">유가 보조금</Text>
              <Text className="text-[14px] font-medium text-gray900">
                +{formatNumberWithComma(subsidy)}원
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      <Pressable
        onPress={onPressOutstanding}
        className="mt-3 rounded-lg bg-white p-3"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1 flex-row flex-wrap items-center gap-1">
            <Ionicons name="time-outline" size={20} color="#BEBEBE" />
            <Text className="text-[14px] font-medium text-gray800">미수금</Text>
            <Text className="text-[18px] font-semibold text-gray900">
              {formatNumberWithComma(data?.outstandingAmount ?? 0)}원
            </Text>
          </View>
          <StatRowButton label="내역" onPress={onPressOutstanding} />
        </View>
      </Pressable>

      <Pressable onPress={onPressFuel} className="mt-3 rounded-lg bg-white p-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 flex-row flex-wrap items-center gap-1">
            <Ionicons name="water" size={20} color="#2E7D32" />
            <Text className="text-[14px] font-medium text-gray800">주유비</Text>
            <Text className="text-[18px] font-semibold text-gray900">
              {formatNumberWithComma(data?.fuelCost ?? 0)}원
            </Text>
          </View>
          <StatRowButton label="내역" onPress={onPressFuel} />
        </View>
      </Pressable>

      <View className="mt-3 flex-row gap-3">
        <Pressable
          ref={otherExpenseRef}
          collapsable={false}
          onPress={onPressOtherExpense}
          className="flex-1 rounded-lg bg-white p-3"
        >
          <View className="flex-row items-center gap-1">
            <Ionicons name="wallet-outline" size={20} color="#737373" />
            <Text className="text-[14px] font-medium text-gray800">기타지출</Text>
          </View>
          <Text className="mt-1 text-[18px] font-bold text-gray900">
            {formatNumberWithComma(data?.otherExpensesCost ?? 0)}원
          </Text>
          <View className="mt-2 items-end">
            <StatRowButton label="내역" onPress={onPressOtherExpense} />
          </View>
        </Pressable>
        <Pressable
          onPress={onPressOtherIncome}
          className="flex-1 rounded-lg bg-white p-3"
        >
          <View className="flex-row items-center gap-1">
            <Ionicons name="trending-up" size={20} color="#5578F0" />
            <Text className="text-[14px] font-medium text-gray800">기타수익</Text>
          </View>
          <Text className="mt-1 text-[18px] font-bold text-gray900">
            {formatNumberWithComma(data?.otherIncome ?? 0)}원
          </Text>
          <View className="mt-2 items-end">
            <StatRowButton label="내역" onPress={onPressOtherIncome} />
          </View>
        </Pressable>
      </View>
    </View>
  );
}
