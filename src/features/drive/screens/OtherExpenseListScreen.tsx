import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Screen } from "@/src/components/common/Screen";
import { appColors } from "@/src/constants/colors";
import { EXPENSE, EXPENSE_UNCLASSIFIED } from "@/src/features/drive/driveConstants";
import { DriveFloatingAddButton } from "@/src/features/drive/components/DriveFloatingAddButton";
import { DriveMonthSummaryBar } from "@/src/features/drive/components/DriveMonthSummaryBar";
import { OtherExpenseCategoryFilterSheet } from "@/src/features/drive/components/OtherExpenseCategoryFilterSheet";
import { OtherExpenseFormBottomSheet } from "@/src/features/drive/components/OtherExpenseFormBottomSheet";
import {
  fetchOtherExpensesCategories,
  fetchOtherExpensesHistory,
} from "@/src/features/drive/driveApi";
import {
  addMonths,
  formatYYYYMMDD,
  getDayOfMonthFromYMD,
  getDayOfWeekFromYMD,
  isSameMonth,
  monthFromBaseDay,
} from "@/src/features/drive/driveDateUtils";
import {
  buildCategoryFilterSummary,
  categoryIdsForApi,
  defaultFilterSelection,
  type CategoryFilterSelection,
} from "@/src/features/drive/otherExpenseFilterUtils";
import type {
  OtherExpenseHistoryDay,
  OtherExpenseHistoryLine,
  OtherExpensesCategory,
} from "@/src/features/drive/types";
import { formatNumberWithComma } from "@/src/features/home/utils";
import { RegistrationHeader } from "@/src/features/sell-car/registration/RegistrationHeader";

function isExpenseType(code?: string) {
  return code === EXPENSE || code === EXPENSE_UNCLASSIFIED;
}

export function OtherExpenseListScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    driveVehicleInfoId?: string;
    baseDay?: string;
  }>();
  const vehicleId = Number(params.driveVehicleInfoId) || 0;
  const [month, setMonth] = useState(() => monthFromBaseDay(params.baseDay));
  const [loading, setLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [days, setDays] = useState<OtherExpenseHistoryDay[]>([]);
  const [categories, setCategories] = useState<OtherExpensesCategory[]>([]);
  const [filterSelection, setFilterSelection] = useState<CategoryFilterSelection>({
    expense: [],
    income: [],
  });
  const [filterLabel, setFilterLabel] = useState("");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editLine, setEditLine] = useState<OtherExpenseHistoryLine | null>(null);
  const [formBaseDay, setFormBaseDay] = useState(
    params.baseDay ?? formatYYYYMMDD(new Date()),
  );

  useEffect(() => {
    if (!vehicleId) return;
    void fetchOtherExpensesCategories(vehicleId)
      .then((list) => {
        setCategories(list);
        setFilterSelection(defaultFilterSelection(list));
      })
      .catch(() => undefined);
  }, [vehicleId]);

  const load = useCallback(async () => {
    if (!vehicleId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const ids = categoryIdsForApi(filterSelection);
      const query: Record<string, string | number> = {
        driveVehicleInfoId: vehicleId,
        baseYearAndMonth: formatYYYYMMDD(month).slice(0, 7),
      };
      if (ids.length > 0) {
        query.otherExpensesCategoriesId = ids.join(",");
      }
      const data = await fetchOtherExpensesHistory(query);
      setDays(data.response ?? []);
      setTotalIncome(data.totalIncome ?? 0);
      setTotalExpense(data.totalExpense ?? 0);
    } catch {
      Alert.alert("오류", "기타내역을 불러오지 못했습니다.");
      setDays([]);
    } finally {
      setLoading(false);
    }
  }, [month, vehicleId, filterSelection]);

  useEffect(() => {
    void load();
  }, [load]);

  const today = new Date();
  const hasData = days.length > 0;

  const openAdd = () => {
    setEditLine(null);
    setFormBaseDay(params.baseDay ?? formatYYYYMMDD(new Date()));
    setFormOpen(true);
  };

  const openEdit = (day: OtherExpenseHistoryDay, line: OtherExpenseHistoryLine) => {
    setEditLine(line);
    setFormBaseDay(day.baseDay);
    setFormOpen(true);
  };

  const clearFilter = () => {
    const next = defaultFilterSelection(categories);
    setFilterSelection(next);
    setFilterLabel("");
  };

  return (
    <Screen className="flex-1 bg-white">
      <RegistrationHeader title="기타내역" />
      <DriveMonthSummaryBar
        leftValue={
          <View>
            <Text className="text-[14px] text-gray700">
              수익 {formatNumberWithComma(totalIncome)}원
            </Text>
            <Text className="mt-1 text-[14px] text-gray700">
              지출 {formatNumberWithComma(totalExpense)}원
            </Text>
          </View>
        }
        month={month}
        canGoNext={!isSameMonth(month, today)}
        onPrevMonth={() => setMonth((m) => addMonths(m, -1))}
        onNextMonth={() => {
          if (!isSameMonth(month, today)) setMonth((m) => addMonths(m, 1));
        }}
      />

      <View className="mx-4 mb-3 flex-row items-center rounded-lg border border-gray300 bg-white px-3 py-3">
        <Pressable
          onPress={() => setFilterSheetOpen(true)}
          className="flex-1 flex-row items-center justify-between"
        >
          <Text
            className={`flex-1 text-[14px] ${filterLabel ? "font-medium text-primary" : "text-gray600"}`}
            numberOfLines={1}
          >
            {filterLabel || "카테고리 검색"}
          </Text>
          {!filterLabel ? (
            <Ionicons name="chevron-down" size={20} color={appColors.gray600} />
          ) : null}
        </Pressable>
        {filterLabel ? (
          <Pressable hitSlop={8} onPress={clearFilter} className="ml-2">
            <Ionicons name="close-circle" size={20} color={appColors.gray600} />
          </Pressable>
        ) : null}
      </View>

      {loading ? (
        <ActivityIndicator className="mt-10" />
      ) : (
        <ScrollView
          className="flex-1 border-t-[8px] border-gray100 px-4"
          contentContainerStyle={{ paddingBottom: insets.bottom + 100, paddingTop: 8 }}
        >
          {!hasData ? (
            <View className="min-h-[300px] items-center justify-center">
              <Text className="text-[16px] text-gray700">기타 내역이 없습니다.</Text>
              <Pressable onPress={openAdd} className="mt-8 rounded-lg bg-primary px-6 py-3">
                <Text className="text-[16px] font-bold text-white">기타내역 추가하기</Text>
              </Pressable>
            </View>
          ) : (
            days.map((day) => (
              <View
                key={day.baseDay}
                className="mb-3 rounded-lg border border-gray300 p-4"
              >
                <View className="flex-row items-center justify-between border-b border-gray200 pb-3">
                  <Text className="text-[14px] font-medium text-gray600">
                    {getDayOfMonthFromYMD(day.baseDay)}일 {getDayOfWeekFromYMD(day.baseDay)}
                  </Text>
                </View>
                <Text
                  className={`mt-2 text-[16px] font-semibold ${
                    day.totalCost < 0 ? "text-gray700" : "text-primary"
                  }`}
                >
                  {day.totalCost < 0 ? "-" : "+"}
                  {formatNumberWithComma(Math.abs(day.totalCost))}원
                </Text>
                {day.data?.map((line, i) => (
                  <Pressable
                    key={`${line.otherExpensesHistoryId}-${i}`}
                    onPress={() => openEdit(day, line)}
                    className="mt-2 flex-row justify-between py-1"
                  >
                    <Text className="flex-1 pr-2 text-[14px] text-gray700" numberOfLines={1}>
                      {line.categoryName}
                      {line.contents ? ` | ${line.contents}` : ""}
                    </Text>
                    <Text className="text-[14px] font-medium text-gray800">
                      {isExpenseType(line.otherExpensesCategoryType?.code) ? "-" : "+"}
                      {formatNumberWithComma(line.price)}원
                    </Text>
                  </Pressable>
                ))}
              </View>
            ))
          )}
        </ScrollView>
      )}
      {hasData ? (
        <DriveFloatingAddButton label="기타내역 추가" onPress={openAdd} />
      ) : null}

      <OtherExpenseCategoryFilterSheet
        visible={filterSheetOpen}
        categories={categories}
        initial={filterSelection}
        onClose={() => setFilterSheetOpen(false)}
        onApply={(selection) => {
          setFilterSelection(selection);
          setFilterLabel(buildCategoryFilterSummary(selection));
        }}
        onClear={clearFilter}
      />

      <OtherExpenseFormBottomSheet
        visible={formOpen}
        driveVehicleInfoId={vehicleId}
        baseDay={formBaseDay}
        editLine={editLine}
        onClose={() => {
          setFormOpen(false);
          setEditLine(null);
        }}
        onSaved={() => void load()}
      />
    </Screen>
  );
}
