import {
  EXPENSE,
  EXPENSE_UNCLASSIFIED,
  INCOME,
  INCOME_UNCLASSIFIED,
} from "@/src/features/drive/driveConstants";
import type { OtherExpensesCategory } from "@/src/features/drive/types";

/** 선택 UI에 표시할 카테고리 (지출/수익만, 미분류 제외) */
export function listCategoriesForType(
  categories: OtherExpensesCategory[],
  categoryType: string,
): OtherExpensesCategory[] {
  return categories.filter((c) => c.type?.code === categoryType);
}

export function resolveOtherExpenseCategoryId(
  categories: OtherExpensesCategory[],
  categoryType: string,
  selectedCategoryId?: number | null,
): number {
  if (selectedCategoryId) return selectedCategoryId;
  const unclassifiedCode =
    categoryType === INCOME ? INCOME_UNCLASSIFIED : EXPENSE_UNCLASSIFIED;
  return categories.find((c) => c.type?.code === unclassifiedCode)?.id ?? 0;
}

export function isExpenseCategoryType(code?: string): boolean {
  return code === EXPENSE || code === EXPENSE_UNCLASSIFIED;
}
