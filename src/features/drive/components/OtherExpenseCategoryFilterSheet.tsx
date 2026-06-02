import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { showAppAlert } from "@/src/providers/appDialog";
import {
  BottomSheet,
  BottomSheetHeader,
} from "@/src/components/common/BottomSheet";
import { appColors } from "@/src/constants/colors";
import { OtherExpenseCategoryFilterPickerSheet } from "@/src/features/drive/components/OtherExpenseCategoryFilterPickerSheet";
import type { OtherExpensesCategory } from "@/src/features/drive/types";
import {
  buildFilterOptions,
  formatFilterSelectLabel,
  type CategoryFilterSelection,
} from "@/src/features/drive/otherExpenseFilterUtils";
import { EXPENSE, INCOME } from "@/src/features/drive/driveConstants";

type FilterKey = "expense" | "income";

type Props = {
  visible: boolean;
  categories: OtherExpensesCategory[];
  initial: CategoryFilterSelection;
  onClose: () => void;
  onApply: (selection: CategoryFilterSelection) => void;
  onClear: () => void;
};

export function OtherExpenseCategoryFilterSheet({
  visible,
  categories,
  initial,
  onClose,
  onApply,
  onClear,
}: Props) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<CategoryFilterSelection>(initial);
  const [expenseEnabled, setExpenseEnabled] = useState(true);
  const [incomeEnabled, setIncomeEnabled] = useState(true);
  const [pickerKey, setPickerKey] = useState<FilterKey | null>(null);

  const expenseOptions = useMemo(
    () => buildFilterOptions(categories, EXPENSE),
    [categories],
  );
  const incomeOptions = useMemo(
    () => buildFilterOptions(categories, INCOME),
    [categories],
  );

  React.useEffect(() => {
    if (!visible) {
      setPickerKey(null);
      return;
    }
    setDraft(initial);
    setExpenseEnabled(initial.expense.length > 0);
    setIncomeEnabled(initial.income.length > 0);
  }, [visible, initial]);

  const bottomPad = Math.max(insets.bottom, 12);
  /** 콘텐츠 높이에 맞춤 (고정 360px 시 하단 빈 공백 과다) */
  const sheetHeight = useMemo(
    () =>
      Math.round(
        57 + // header
        8 + // pt-2
        64 * 2 + // 지출·수익 행
        44 + // 필터 초기화
        bottomPad,
      ),
    [bottomPad],
  );

  const tryClose = () => {
    const hasAny =
      (expenseEnabled && draft.expense.length > 0) ||
      (incomeEnabled && draft.income.length > 0);
    if (!hasAny) {
      showAppAlert({ title: "선택된 카테고리가 없습니다", message: "1개 이상의 카테고리를 선택하면\n필터 적용이 가능합니다." });
      return;
    }
    onApply(draft);
    onClose();
  };

  const toggleTypeEnabled = (key: FilterKey) => {
    if (key === "expense") {
      const next = !expenseEnabled;
      setExpenseEnabled(next);
      setDraft((d) => ({
        ...d,
        expense: next ? expenseOptions : [],
      }));
    } else {
      const next = !incomeEnabled;
      setIncomeEnabled(next);
      setDraft((d) => ({
        ...d,
        income: next ? incomeOptions : [],
      }));
    }
  };

  const openPicker = (key: FilterKey) => {
    if (key === "expense") {
      if (!expenseEnabled) setExpenseEnabled(true);
      setDraft((d) => ({
        ...d,
        expense: d.expense.length > 0 ? d.expense : expenseOptions,
      }));
    } else {
      if (!incomeEnabled) setIncomeEnabled(true);
      setDraft((d) => ({
        ...d,
        income: d.income.length > 0 ? d.income : incomeOptions,
      }));
    }
    setPickerKey(key);
  };

  const pickerTitle = pickerKey === "income" ? "수익 카테고리 선택" : "지출 카테고리 선택";

  return (
    <>
      <BottomSheet
        visible={visible}
        onClose={tryClose}
        sheetHeight={sheetHeight}
        contentLayout="hug"
        noModal
        overlayZIndex={1000}
        showBackdrop={pickerKey === null}
      >
        <View className="bg-white" style={{ paddingBottom: bottomPad }}>
          <BottomSheetHeader title="카테고리 필터" onClose={tryClose} />
          <View className="px-4 pt-2">
            <FilterTypeRow
              label="지출"
              enabled={expenseEnabled}
              value={formatFilterSelectLabel(draft.expense) || "전체"}
              onToggle={() => toggleTypeEnabled("expense")}
              onOpenSelect={() => openPicker("expense")}
            />
            <FilterTypeRow
              label="수익"
              enabled={incomeEnabled}
              value={formatFilterSelectLabel(draft.income) || "전체"}
              onToggle={() => toggleTypeEnabled("income")}
              onOpenSelect={() => openPicker("income")}
            />
            <Pressable onPress={onClear} className="mt-6 items-end py-2">
              <Text className="text-[16px] text-gray700 underline">필터 초기화</Text>
            </Pressable>
          </View>
        </View>
      </BottomSheet>

      <OtherExpenseCategoryFilterPickerSheet
        visible={pickerKey !== null}
        title={pickerTitle}
        options={pickerKey === "income" ? incomeOptions : expenseOptions}
        selected={pickerKey === "income" ? draft.income : draft.expense}
        onClose={() => setPickerKey(null)}
        onChange={(next) => {
          if (!pickerKey) return;
          setDraft((d) => ({ ...d, [pickerKey]: next }));
        }}
      />
    </>
  );
}

function FilterTypeRow({
  label,
  enabled,
  value,
  onToggle,
  onOpenSelect,
}: {
  label: string;
  enabled: boolean;
  value: string;
  onToggle: () => void;
  onOpenSelect: () => void;
}) {
  return (
    <View className="mb-4 flex-row items-center">
      <Pressable onPress={onToggle} hitSlop={8} className="mr-2">
        <Ionicons
          name={enabled ? "checkmark-circle" : "ellipse-outline"}
          size={22}
          color={enabled ? appColors.primary : appColors.gray500}
        />
      </Pressable>
      <Text className="mr-3 min-w-[40px] text-[16px] text-gray900">{label}</Text>
      <Pressable
        onPress={onOpenSelect}
        className={`flex-1 flex-row items-center justify-between rounded-lg border px-3 py-3 ${
          enabled ? "border-gray300 bg-white" : "border-gray200 bg-gray100"
        }`}
      >
        <Text
          className={`flex-1 text-[16px] ${enabled ? "text-gray900" : "text-gray500"}`}
          numberOfLines={1}
        >
          {value}
        </Text>
        <Ionicons name="chevron-down" size={18} color={appColors.gray600} />
      </Pressable>
    </View>
  );
}
