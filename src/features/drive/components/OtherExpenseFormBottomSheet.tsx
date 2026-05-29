import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import {
  BottomSheet,
  BottomSheetHeader,
} from "@/src/components/common/BottomSheet";
import { appColors } from "@/src/constants/colors";
import { DriveDateCalendarPicker } from "@/src/features/drive/components/DriveDateCalendarPicker";
import { DriveFormRow } from "@/src/features/drive/components/DriveFormRow";
import { DriveTutorialAnchor } from "@/src/features/drive/components/DriveTutorialAnchor";
import { OtherExpenseCategorySheet } from "@/src/features/drive/components/OtherExpenseCategorySheet";
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
import { ConfirmDialog } from "@/src/components/common/ConfirmDialog";
import { DualFooterButtons } from "@/src/features/sell-car/registration/DualFooterButtons";
import {
  useDriveOtherExpenseSheetHeight,
  useDriveSheetFooterPadding,
  useDriveTopReserved,
} from "@/src/features/drive/useDriveSheetHeight";
import { PriceTrendRadioGroup } from "@/src/features/price-trend/PriceTrendRadioGroup";
import { formatNumberWithComma } from "@/src/features/home/utils";

type Props = {
  visible: boolean;
  driveVehicleInfoId: number;
  baseDay: string;
  editLine?: OtherExpenseHistoryLine | null;
  tutorialStep?: number | null;
  tutorialOpenCategory?: boolean;
  tutorialOverlay?: React.ReactNode;
  tutorialSubSheetOverlay?: React.ReactNode;
  noModal?: boolean;
  onTutorialCategoryPress?: () => void;
  onClose: () => void;
  onSaved: () => void;
};

export function OtherExpenseFormBottomSheet({
  visible,
  driveVehicleInfoId,
  baseDay,
  editLine,
  tutorialStep,
  tutorialOpenCategory = false,
  tutorialOverlay,
  tutorialSubSheetOverlay,
  noModal = false,
  onTutorialCategoryPress,
  onClose,
  onSaved,
}: Props) {
  const editId = editLine?.otherExpensesHistoryId;
  const [formDay, setFormDay] = useState(baseDay);
  const [categoryType, setCategoryType] = useState(EXPENSE);
  const [categories, setCategories] = useState<OtherExpensesCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<OtherExpensesCategory | null>(
    null,
  );
  const [contents, setContents] = useState("");
  const [price, setPrice] = useState("");
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const sheetHeight = useDriveOtherExpenseSheetHeight();
  const minTopInset = useDriveTopReserved();
  const footerPaddingBottom = useDriveSheetFooterPadding();

  useEffect(() => {
    if (!visible) {
      setCategorySheetOpen(false);
      return;
    }
    if (tutorialStep === 5 || tutorialOpenCategory) {
      setCategorySheetOpen(true);
      return;
    }
    setCategorySheetOpen(false);
  }, [visible, tutorialStep, tutorialOpenCategory]);

  useEffect(() => {
    if (!visible) return;
    const lineType = editLine?.otherExpensesCategoryType?.code;
    setFormDay(editLine ? baseDay : baseDay);
    setCategoryType(
      lineType === INCOME || lineType === INCOME_UNCLASSIFIED ? INCOME : EXPENSE,
    );
    setContents(editLine?.contents ?? "");
    setPrice(editLine?.price ? formatNumberWithComma(editLine.price) : "");
    setSelectedCategory(null);
    void fetchOtherExpensesCategories(driveVehicleInfoId)
      .then((list) => {
        setCategories(list);
        if (editLine?.otherExpensesCategoryId) {
          const found = list.find((c) => c.id === editLine.otherExpensesCategoryId);
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
      .catch(() => setCategories([]));
  }, [visible, baseDay, driveVehicleInfoId, editLine]);

  const submit = async () => {
    const priceNum = Number(price.replace(/,/g, ""));
    if (!priceNum) {
      Alert.alert("입력 확인", "금액을 입력해주세요.");
      return;
    }
    try {
      setSubmitting(true);
      const body = {
        baseDay: formDay,
        contents: contents || null,
        driveVehicleInfoId,
        otherExpensesCategoryId: resolveOtherExpenseCategoryId(
          categories,
          categoryType,
          selectedCategory?.id,
        ),
        price: priceNum,
      };
      if (editId) {
        await updateOtherExpenseHistory(editId, body);
      } else {
        await saveOtherExpenseHistory(body);
      }
      onSaved();
      onClose();
    } catch {
      Alert.alert("오류", "저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <BottomSheet
        visible={visible}
        onClose={onClose}
        sheetHeight={sheetHeight}
        minTopInset={minTopInset}
        noModal={noModal}
        tutorialOverlay={tutorialOverlay}
      >
        <View className="flex-1 bg-white">
          <BottomSheetHeader
            title={editId ? "기타내역 수정" : "기타내역 추가"}
            onClose={onClose}
          />
          <ScrollView
            className="flex-1"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 8 }}
          >
            <DriveFormRow
              label="날짜"
              value={formDay}
              onPress={() => setCalendarOpen(true)}
            />

            <DriveTutorialAnchor step={4}>
              <View className="px-4 py-4">
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
              </View>

              <DriveFormRow
              label="카테고리"
              value={selectedCategory?.name ?? ""}
              placeholder="카테고리 선택"
              onPress={() => {
                if (tutorialStep === 4) {
                  setCategorySheetOpen(true);
                  onTutorialCategoryPress?.();
                  return;
                }
                setCategorySheetOpen(true);
              }}
              rightElement={
                selectedCategory?.name ? (
                  <Pressable
                    hitSlop={8}
                    onPress={(e) => {
                      e.stopPropagation?.();
                      setSelectedCategory(null);
                    }}
                  >
                    <Ionicons name="close" size={20} color={appColors.gray600} />
                  </Pressable>
                ) : (
                  <Ionicons name="chevron-forward" size={20} color={appColors.gray600} />
                )
              }
            />
            </DriveTutorialAnchor>
            <DriveFormRow
              label="내용"
              editable
              value={contents}
              placeholder="내용 입력"
              onChangeText={(t) => setContents(t.slice(0, 120))}
            />
            <DriveFormRow
              label="금액"
              required
              editable
              value={price}
              placeholder="금액 입력"
              unit="원"
              keyboardType="number-pad"
              onChangeText={(t) =>
                setPrice(formatNumberWithComma(t.replace(/[^\d]/g, "").slice(0, 11)))
              }
            />
          </ScrollView>

          <View
            className="border-t border-gray200 bg-white px-4 pt-3"
            style={{ paddingBottom: footerPaddingBottom }}
          >
            {editId ? (
              <DualFooterButtons
                safeAreaBottom={false}
                leftLabel="삭제"
                onPressLeft={() => setDeleteOpen(true)}
                rightLabel="저장"
                loading={submitting}
                onPressRight={submit}
              />
            ) : (
              <Pressable
                onPress={submit}
                disabled={submitting}
                className="items-center rounded-lg bg-primary py-4"
              >
                <Text className="text-[16px] font-bold text-white">
                  {submitting ? "저장 중..." : "저장"}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </BottomSheet>

      <DriveDateCalendarPicker
        visible={calendarOpen}
        selectedYmd={formDay}
        onClose={() => setCalendarOpen(false)}
        onSelect={setFormDay}
      />

      <ConfirmDialog
        visible={deleteOpen}
        title="기타내역 삭제"
        rightLabel="삭제"
        onLeft={() => setDeleteOpen(false)}
        onRight={async () => {
          if (!editId) return;
          try {
            setSubmitting(true);
            await removeOtherExpenseHistories([editId]);
            onSaved();
            onClose();
          } catch {
            Alert.alert("오류", "삭제에 실패했습니다.");
          } finally {
            setSubmitting(false);
            setDeleteOpen(false);
          }
        }}
      >
        <Text className="text-center text-[14px] text-gray700">삭제하시겠습니까?</Text>
      </ConfirmDialog>

      <OtherExpenseCategorySheet
        visible={categorySheetOpen}
        categoryType={categoryType}
        driveVehicleInfoId={driveVehicleInfoId}
        categories={categories}
        selectedCategoryId={selectedCategory?.id ?? null}
        initialManageMode={tutorialStep === 5}
        tutorialOverlay={tutorialSubSheetOverlay}
        noModal={noModal}
        onClose={() => setCategorySheetOpen(false)}
        onSelect={setSelectedCategory}
        onCategoriesChange={setCategories}
      />
    </>
  );
}
