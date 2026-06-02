import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { showAppAlert } from "@/src/providers/appDialog";

import {
  BottomSheet,
  BottomSheetHeader,
} from "@/src/components/common/BottomSheet";
import { DriveTutorialAnchor } from "@/src/features/drive/components/DriveTutorialAnchor";
import { ConfirmDialog } from "@/src/components/common/ConfirmDialog";
import { appColors } from "@/src/constants/colors";
import { EXPENSE, INCOME } from "@/src/features/drive/driveConstants";
import {
  createOtherExpensesCategoryItem,
  removeOtherExpensesCategoryItem,
  updateOtherExpensesCategoryItem,
} from "@/src/features/drive/driveApi";
import type { OtherExpensesCategory } from "@/src/features/drive/types";
import { useDriveTopReserved } from "@/src/features/drive/useDriveSheetHeight";

const CATEGORY_TITLE: Record<string, string> = {
  [EXPENSE]: "지출",
  [INCOME]: "수익",
};

type Props = {
  visible: boolean;
  categoryType: string;
  driveVehicleInfoId: number;
  categories: OtherExpensesCategory[];
  selectedCategoryId: number | null;
  initialManageMode?: boolean;
  tutorialOverlay?: React.ReactNode;
  noModal?: boolean;
  onClose: () => void;
  onSelect: (category: OtherExpensesCategory) => void;
  onCategoriesChange: (categories: OtherExpensesCategory[]) => void;
};

export function OtherExpenseCategorySheet({
  visible,
  categoryType,
  driveVehicleInfoId,
  categories,
  selectedCategoryId,
  initialManageMode = false,
  tutorialOverlay,
  noModal = false,
  onClose,
  onSelect,
  onCategoriesChange,
}: Props) {
  const insets = useSafeAreaInsets();
  const minTopInset = useDriveTopReserved();
  const sheetHeight = Math.round(Dimensions.get("window").height * 0.72);

  const [manageMode, setManageMode] = useState(false);
  const [pendingSelectId, setPendingSelectId] = useState<string>(
    selectedCategoryId ? String(selectedCategoryId) : "",
  );
  const [nameSheetOpen, setNameSheetOpen] = useState(false);
  const [categoryInput, setCategoryInput] = useState("");
  const [editingCategory, setEditingCategory] = useState<OtherExpensesCategory | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<OtherExpensesCategory | null>(null);
  const [saving, setSaving] = useState(false);

  const typeCategories = useMemo(
    () => categories.filter((c) => c.type?.code === categoryType),
    [categories, categoryType],
  );

  useEffect(() => {
    if (!visible) return;
    setManageMode(initialManageMode);
    setPendingSelectId(selectedCategoryId ? String(selectedCategoryId) : "");
  }, [visible, selectedCategoryId, initialManageMode]);

  const title = `${CATEGORY_TITLE[categoryType] ?? ""} 카테고리`;

  const openNameSheet = (item?: OtherExpensesCategory) => {
    if (item) {
      setEditingCategory(item);
      setCategoryInput(item.name);
    } else {
      setEditingCategory(null);
      setCategoryInput("");
    }
    setNameSheetOpen(true);
  };

  const saveCategoryName = async () => {
    const name = categoryInput.trim();
    if (!name) return;
    try {
      setSaving(true);
      if (editingCategory?.id) {
        const updated = await updateOtherExpensesCategoryItem({
          otherExpensesCategoryId: editingCategory.id,
          name,
        });
        onCategoriesChange(
          categories.map((c) => (c.id === updated.id ? updated : c)),
        );
      } else {
        const created = await createOtherExpensesCategoryItem({
          driveVehicleInfoId,
          name,
          type: categoryType,
        });
        onCategoriesChange([...categories, created]);
      }
      setNameSheetOpen(false);
    } catch {
      showAppAlert({ title: "오류", message: "카테고리 저장에 실패했습니다." });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setSaving(true);
      await removeOtherExpensesCategoryItem(deleteTarget.id);
      onCategoriesChange(categories.filter((c) => c.id !== deleteTarget.id));
      if (pendingSelectId === String(deleteTarget.id)) {
        setPendingSelectId("");
      }
      if (selectedCategoryId === deleteTarget.id) {
        // 선택 해제는 부모에서 처리하지 않음 — 폼에서 미분류로 저장됨
      }
    } catch {
      showAppAlert({ title: "오류", message: "카테고리 삭제에 실패했습니다." });
    } finally {
      setSaving(false);
      setDeleteTarget(null);
    }
  };

  const handleSelect = () => {
    const found = typeCategories.find((c) => String(c.id) === pendingSelectId);
    if (found) {
      onSelect(found);
      onClose();
    }
  };

  const renderManageList = () => (
    <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
      {typeCategories.map((item) => (
        <View
          key={item.id}
          className="flex-row items-center border-b border-gray200 px-4"
          style={{ minHeight: 42 }}
        >
          <Pressable
            onPress={() => setDeleteTarget(item)}
            hitSlop={8}
            className="mr-1.5"
          >
            <Ionicons name="remove-circle" size={24} color="#E53935" />
          </Pressable>
          <Pressable className="flex-1 py-3" onPress={() => openNameSheet(item)}>
            <Text className="text-[16px] text-gray900">{item.name}</Text>
          </Pressable>
        </View>
      ))}
      <Pressable
        className="flex-row items-center px-4 py-4"
        onPress={() => openNameSheet()}
      >
        <Ionicons name="add-circle-outline" size={24} color="#9E9E9E" />
        <Text className="ml-1.5 text-[16px] text-gray600">카테고리 추가</Text>
      </Pressable>
    </ScrollView>
  );

  const renderSelectList = () => {
    if (typeCategories.length === 0) {
      return (
        <View className="flex-1 items-center justify-center px-4 pb-8">
          <Text className="mb-8 text-[16px] text-gray600">
            등록된 카테고리가 없습니다.
          </Text>
          <Pressable
            onPress={() => openNameSheet()}
            className="rounded-lg bg-gray100 px-8 py-3"
          >
            <Text className="text-[16px] font-semibold text-gray700">
              새 카테고리 추가하기
            </Text>
          </Pressable>
        </View>
      );
    }

    return (
      <>
        <ScrollView className="flex-1">
          {typeCategories.map((item) => {
            const selected = pendingSelectId === String(item.id);
            return (
              <Pressable
                key={item.id}
                className="flex-row items-center justify-between border-b border-gray200 px-4 py-4"
                onPress={() => setPendingSelectId(String(item.id))}
              >
                <Text
                  className={`text-[16px] ${selected ? "font-bold text-primary" : "text-gray800"}`}
                >
                  {item.name}
                </Text>
                {selected ? (
                  <Ionicons name="checkmark" size={20} color={appColors.primary} />
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>
        <View
          className="border-t border-gray200 bg-white px-4 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <Pressable
            onPress={handleSelect}
            disabled={!pendingSelectId}
            className={`items-center rounded-lg py-4 ${
              pendingSelectId ? "bg-primary" : "bg-gray300"
            }`}
          >
            <Text className="text-[16px] font-bold text-white">선택</Text>
          </Pressable>
        </View>
      </>
    );
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
          <View className="flex-row items-center justify-center border-b border-gray200 px-4 py-4">
            <Pressable
              onPress={onClose}
              hitSlop={8}
              className="absolute left-4"
            >
              <Ionicons name="chevron-back" size={24} color="#414141" />
            </Pressable>
            <Text className="text-[16px] font-bold text-gray900">{title}</Text>
            <DriveTutorialAnchor step={5} className="absolute right-4">
              <Pressable
                onPress={() => setManageMode((m) => !m)}
                hitSlop={8}
              >
                <Text className="text-[14px] text-gray700">
                  {manageMode ? "닫기" : "편집"}
                </Text>
              </Pressable>
            </DriveTutorialAnchor>
          </View>
          {manageMode ? renderManageList() : renderSelectList()}
        </View>
      </BottomSheet>

      <BottomSheet
        visible={nameSheetOpen}
        onClose={() => setNameSheetOpen(false)}
        sheetHeight={280}
        contentLayout="hug"
      >
        <View className="bg-white pb-6">
          <BottomSheetHeader
            title={`${CATEGORY_TITLE[categoryType] ?? ""} 카테고리 ${editingCategory ? "수정" : "추가"}`}
            onClose={() => setNameSheetOpen(false)}
          />
          <View className="px-4 pt-4">
            <View className="flex-row items-center">
              <TextInput
                className="flex-1 border-b border-gray300 pb-2 text-[18px] text-gray900"
                placeholder="카테고리명 입력"
                value={categoryInput}
                onChangeText={(t) => setCategoryInput(t.slice(0, 15))}
                maxLength={15}
              />
              <Pressable
                onPress={saveCategoryName}
                disabled={!categoryInput.trim() || saving}
                className={`ml-2 rounded-xl px-4 py-1.5 ${
                  categoryInput.trim() ? "bg-primary" : "bg-gray300"
                }`}
              >
                <Text className="text-[14px] font-semibold text-white">확인</Text>
              </Pressable>
            </View>
            <Text className="mt-2 text-[14px] text-gray600">
              최대 15자까지 입력 가능합니다.
            </Text>
          </View>
        </View>
      </BottomSheet>

      <ConfirmDialog
        visible={!!deleteTarget}
        title={
          deleteTarget
            ? `'${deleteTarget.name}' 카테고리를\n삭제할까요?`
            : ""
        }
        rightLabel="삭제"
        onLeft={() => setDeleteTarget(null)}
        onRight={confirmDelete}
      >
        <Text className="text-center text-[14px] text-gray700">
          *카테고리에 포함된 내역은 모두{"\n"}'미분류'로 구분됩니다.
        </Text>
      </ConfirmDialog>
    </>
  );
}
