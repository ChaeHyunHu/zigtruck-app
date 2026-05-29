import {
  EXPENSE,
  EXPENSE_UNCLASSIFIED,
  INCOME,
  INCOME_UNCLASSIFIED,
} from "@/src/features/drive/driveConstants";
import type { OtherExpensesCategory } from "@/src/features/drive/types";

export type FilterOption = { code: string; desc: string };

export type CategoryFilterSelection = {
  expense: FilterOption[];
  income: FilterOption[];
};

export function buildFilterOptions(
  categories: OtherExpensesCategory[],
  type: string,
): FilterOption[] {
  const items = categories.filter(
    (c) => c.type?.code === type || c.type?.code === `${type}_UNCLASSIFIED`,
  );
  return [
    { code: "ALL", desc: "전체" },
    ...items.map((c) => ({ code: String(c.id), desc: c.name || "미분류" })),
  ];
}

export function defaultFilterSelection(
  categories: OtherExpensesCategory[],
): CategoryFilterSelection {
  return {
    expense: buildFilterOptions(categories, EXPENSE),
    income: buildFilterOptions(categories, INCOME),
  };
}

export function selectionIncludesAll(selected: FilterOption[]): boolean {
  return selected.some((o) => o.code === "ALL");
}

export function formatFilterSelectLabel(selected: FilterOption[]): string {
  if (selected.length === 0) return "";
  if (selectionIncludesAll(selected)) return "전체";
  const names = selected.filter((o) => o.code !== "ALL").map((o) => o.desc);
  if (names.length === 0) return "전체";
  if (names.length === 1) return names[0]!;
  return `${names[0]} 외 ${names.length - 1}건`;
}

export function buildCategoryFilterSummary(
  selection: CategoryFilterSelection,
): string {
  const expenseAll = selectionIncludesAll(selection.expense);
  const incomeAll = selectionIncludesAll(selection.income);
  if (expenseAll && incomeAll) return "";

  const parts: string[] = [];
  if (!expenseAll && selection.expense.length > 0) {
    parts.push(`지출 ${formatFilterSelectLabel(selection.expense)}`);
  } else if (expenseAll) {
    parts.push("지출 전체");
  }
  if (!incomeAll && selection.income.length > 0) {
    parts.push(`수익 ${formatFilterSelectLabel(selection.income)}`);
  } else if (incomeAll) {
    parts.push("수익 전체");
  }
  return parts.join(" · ");
}

export function categoryIdsForApi(selection: CategoryFilterSelection): string[] {
  if (
    selectionIncludesAll(selection.expense) &&
    selectionIncludesAll(selection.income)
  ) {
    return [];
  }
  const ids = [
    ...selection.expense.filter((o) => o.code !== "ALL").map((o) => o.code),
    ...selection.income.filter((o) => o.code !== "ALL").map((o) => o.code),
  ];
  return [...new Set(ids)];
}

export function toggleFilterOption(
  selected: FilterOption[],
  allOptions: FilterOption[],
  item: FilterOption,
): FilterOption[] {
  const isSelected = selected.some((o) => o.code === item.code);

  if (item.code === "ALL") {
    return isSelected ? [] : [...allOptions];
  }

  if (isSelected) {
    const next = selected.filter((o) => o.code !== item.code && o.code !== "ALL");
    return next;
  }

  const next = [...selected.filter((o) => o.code !== "ALL"), item];
  const categoryCodes = allOptions
    .filter((o) => o.code !== "ALL")
    .map((o) => o.code);
  const allPicked = categoryCodes.every((code) =>
    next.some((o) => o.code === code),
  );
  if (allPicked) return [...allOptions];
  return next;
}

export function isIncomeLineType(code?: string): boolean {
  return code === INCOME || code === INCOME_UNCLASSIFIED;
}
