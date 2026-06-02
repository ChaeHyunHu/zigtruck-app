import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { KeyboardAwareScrollView } from "@/src/components/common/KeyboardAwareScrollView";
import { ConfirmDialog } from "@/src/components/common/ConfirmDialog";
import { Screen } from "@/src/components/common/Screen";
import { ScreenStickyFooter } from "@/src/components/common/ScreenStickyFooter";
import { appColors } from "@/src/constants/colors";
import { LabeledTextInput } from "@/src/features/additional-services/components/LabeledTextInput";
import { OtherExpenseCategorySheet } from "@/src/features/drive/components/OtherExpenseCategorySheet";
import { showAppAlert } from "@/src/providers/appDialog";
import {
  EXPENSE,
  EXPENSE_UNCLASSIFIED,
  INCOME,
  INCOME_UNCLASSIFIED,
} from "@/src/features/drive/driveConstants";
import {
  fetchOtherExpensesCategories,
  removeOtherExpenseHistories,
  saveOtherExpenseHistory,
  updateOtherExpenseHistory,
} from "@/src/features/drive/driveApi";
import { formatYYYYMMDD } from "@/src/features/drive/driveDateUtils";
import { resolveOtherExpenseCategoryId } from "@/src/features/drive/otherExpenseCategoryUtils";
import type {
  OtherExpenseHistoryLine,
  OtherExpensesCategory,
} from "@/src/features/drive/types";
import { PriceTrendRadioGroup } from "@/src/features/price-trend/PriceTrendRadioGroup";
import { PriceTrendSelectField } from "@/src/features/price-trend/PriceTrendSelectField";
import { DualFooterButtons } from "@/src/features/sell-car/registration/DualFooterButtons";
import { RegistrationHeader } from "@/src/features/sell-car/registration/RegistrationHeader";
import { formatNumberWithComma } from "@/src/features/home/utils";

export function OtherExpenseFormScreen() {
  const params = useLocalSearchParams<{
    driveVehicleInfoId?: string;
    baseDay?: string;
    data?: string;
    line?: string;
  }>();
  const vehicleId = Number(params.driveVehicleInfoId);
  const line: OtherExpenseHistoryLine | null = useMemo(() => {
    if (!params.line) return null;
    try {
      return JSON.parse(params.line) as OtherExpenseHistoryLine;
    } catch {
      return null;
    }
  }, [params.line]);

  const editId = line?.otherExpensesHistoryId;
  const [baseDay, setBaseDay] = useState(
    line ? params.baseDay ?? formatYYYYMMDD(new Date()) : params.baseDay ?? formatYYYYMMDD(new Date()),
  );
  const [categoryType, setCategoryType] = useState(
    line?.otherExpensesCategoryType?.code === INCOME ||
      line?.otherExpensesCategoryType?.code === INCOME_UNCLASSIFIED
      ? INCOME
      : EXPENSE,
  );
  const [categories, setCategories] = useState<OtherExpensesCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<OtherExpensesCategory | null>(null);
  const [contents, setContents] = useState(line?.contents ?? "");
  const [price, setPrice] = useState(
    line?.price ? formatNumberWithComma(line.price) : "",
  );
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    fetchOtherExpensesCategories(vehicleId)
      .then((list) => {
        setCategories(list);
        if (line?.otherExpensesCategoryId) {
          const found = list.find((c) => c.id === line.otherExpensesCategoryId);
          const code = found?.type?.code;
          if (
            found &&
            code !== EXPENSE_UNCLASSIFIED &&
            code !== INCOME_UNCLASSIFIED
          ) {
            setSelectedCategory(found);
          }
        }
      })
      .catch(() => undefined);
  }, [line, vehicleId]);

  const submit = async () => {
    const priceNum = Number(price.replace(/,/g, ""));
    if (!priceNum) {
      showAppAlert({ title: "입력 확인", message: "금액을 입력해주세요." });
      return;
    }
    const categoryId = resolveOtherExpenseCategoryId(
      categories,
      categoryType,
      selectedCategory?.id,
    );
    const body = {
      baseDay,
      contents: contents || null,
      driveVehicleInfoId: vehicleId,
      otherExpensesCategoryId: categoryId,
      price: priceNum,
    };
    try {
      setSubmitting(true);
      if (editId) {
        await updateOtherExpenseHistory(editId, body);
        showAppAlert({ title: "완료", message: "기타내역이 수정되었습니다.", onConfirm: () => router.back() });
      } else {
        await saveOtherExpenseHistory(body);
        router.back();
      }
    } catch {
      showAppAlert({ title: "오류", message: "저장에 실패했습니다." });
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async () => {
    if (!editId) return;
    try {
      setSubmitting(true);
      await removeOtherExpenseHistories([editId]);
      router.back();
    } catch {
      showAppAlert({ title: "오류", message: "삭제에 실패했습니다." });
    } finally {
      setSubmitting(false);
      setDeleteOpen(false);
    }
  };

  return (
    <Screen className="flex-1 bg-white">
      <RegistrationHeader title={editId ? "기타내역 수정" : "기타내역 추가"} />
      <KeyboardAwareScrollView className="flex-1" footerInset={80}>
        <View className="gap-5 px-4 pb-28 pt-4">
          <LabeledTextInput
            label="날짜"
            value={baseDay}
            placeholder="YYYY-MM-DD"
            onChangeText={setBaseDay}
          />
          <PriceTrendRadioGroup
            label="분류"
            horizontal
            options={[
              { code: EXPENSE, label: "지출" },
              { code: INCOME, label: "수익" },
            ]}
            value={categoryType}
            onChange={(code) => {
              setCategoryType(code);
              setSelectedCategory(null);
            }}
          />
          <PriceTrendSelectField
            label="카테고리"
            placeholder="카테고리 선택"
            value={selectedCategory?.name ?? ""}
            onPress={() => setCategorySheetOpen(true)}
            rightElement={
              selectedCategory?.name ? (
                <Pressable hitSlop={8} onPress={() => setSelectedCategory(null)}>
                  <Ionicons name="close" size={20} color={appColors.gray600} />
                </Pressable>
              ) : undefined
            }
          />
          <LabeledTextInput
            label="내용"
            value={contents}
            placeholder="내용 입력"
            onChangeText={(t) => setContents(t.slice(0, 120))}
          />
          <LabeledTextInput
            label="금액"
            required
            value={price}
            unit="원"
            keyboardType="number-pad"
            onChangeText={(t) =>
              setPrice(formatNumberWithComma(t.replace(/[^\d]/g, "").slice(0, 11)))
            }
          />
        </View>
      </KeyboardAwareScrollView>

      <ScreenStickyFooter className="border-t-0">
        <DualFooterButtons
          safeAreaBottom={false}
          leftLabel={editId ? "삭제" : undefined}
          onPressLeft={editId ? () => setDeleteOpen(true) : undefined}
          rightLabel="저장"
          loading={submitting}
          onPressRight={submit}
        />
      </ScreenStickyFooter>

      <OtherExpenseCategorySheet
        visible={categorySheetOpen}
        categoryType={categoryType}
        driveVehicleInfoId={vehicleId}
        categories={categories}
        selectedCategoryId={selectedCategory?.id ?? null}
        onClose={() => setCategorySheetOpen(false)}
        onSelect={setSelectedCategory}
        onCategoriesChange={setCategories}
      />

      <ConfirmDialog
        visible={deleteOpen}
        title="기타내역 삭제"
        rightLabel="삭제"
        onLeft={() => setDeleteOpen(false)}
        onRight={onDelete}
      >
        <Text className="text-center text-[14px] text-gray700">삭제하시겠습니까?</Text>
      </ConfirmDialog>
    </Screen>
  );
}
