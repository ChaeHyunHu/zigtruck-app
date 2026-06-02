import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { ConfirmDialog } from "@/src/components/common/ConfirmDialog";
import { Screen } from "@/src/components/common/Screen";
import { showAppAlert } from "@/src/providers/appDialog";
import {
  EXPENSE,
  EXPENSE_UNCLASSIFIED,
} from "@/src/features/drive/driveConstants";
import { removeOtherExpenseHistories } from "@/src/features/drive/driveApi";
import { formatMonthDayLabel, parseYMD } from "@/src/features/drive/driveDateUtils";
import type { OtherExpenseHistoryDay } from "@/src/features/drive/types";
import { formatNumberWithComma } from "@/src/features/home/utils";
import { RegistrationHeader } from "@/src/features/sell-car/registration/RegistrationHeader";

function isExpenseType(code?: string) {
  return code === EXPENSE || code === EXPENSE_UNCLASSIFIED;
}

export function OtherExpenseDetailScreen() {
  const params = useLocalSearchParams<{
    driveVehicleInfoId?: string;
    baseDay?: string;
    data?: string;
  }>();
  const day: OtherExpenseHistoryDay | null = useMemo(() => {
    if (!params.data) return null;
    try {
      return JSON.parse(params.data) as OtherExpenseHistoryDay;
    } catch {
      return null;
    }
  }, [params.data]);

  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const title = params.baseDay
    ? formatMonthDayLabel(parseYMD(params.baseDay))
    : "기타내역";

  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const onDelete = async () => {
    if (selected.length === 0) return;
    try {
      await removeOtherExpenseHistories(selected);
      router.back();
    } catch {
      showAppAlert({ title: "오류", message: "삭제에 실패했습니다." });
    } finally {
      setDeleteOpen(false);
    }
  };

  return (
    <Screen className="flex-1 bg-white">
      <RegistrationHeader
        title={`기타내역 ${title}`}
        rightElement={
          day?.data?.length ? (
            <Pressable
              onPress={() => {
                setEditMode((v) => !v);
                setSelected([]);
              }}
              hitSlop={8}
            >
              <Text className="text-[14px] font-medium text-gray800">
                {editMode ? "닫기" : "편집"}
              </Text>
            </Pressable>
          ) : undefined
        }
      />

      <ScrollView className="flex-1 px-4 pt-4">
        {!day?.data?.length ? (
          <Text className="py-16 text-center text-[14px] text-gray600">
            등록된 내역이 없습니다.
          </Text>
        ) : (
          day.data.map((line) => (
            <Pressable
              key={line.otherExpensesHistoryId}
              onPress={() => {
                if (editMode) {
                  toggleSelect(line.otherExpensesHistoryId);
                  return;
                }
                router.push({
                  pathname: "/drive/other-expense/form",
                  params: {
                    driveVehicleInfoId: params.driveVehicleInfoId ?? "",
                    baseDay: day.baseDay,
                    line: JSON.stringify(line),
                  },
                });
              }}
              className={`mb-3 rounded-lg border p-4 ${
                editMode && selected.includes(line.otherExpensesHistoryId)
                  ? "border-primary bg-[#F8FAFF]"
                  : "border-gray300"
              }`}
            >
              <Text className="text-[15px] font-semibold text-gray900">
                {line.categoryName}
              </Text>
              {line.contents ? (
                <Text className="mt-1 text-[14px] text-gray700">{line.contents}</Text>
              ) : null}
              <Text className="mt-2 text-[16px] font-bold text-gray900">
                {isExpenseType(line.otherExpensesCategoryType?.code) ? "-" : "+"}
                {formatNumberWithComma(line.price)}원
              </Text>
            </Pressable>
          ))
        )}
      </ScrollView>

      <View className="border-t border-gray300 px-4 py-3">
        {editMode ? (
          <Pressable
            onPress={() => (selected.length ? setDeleteOpen(true) : undefined)}
            className={`h-12 items-center justify-center rounded-lg ${
              selected.length ? "bg-danger" : "bg-gray300"
            }`}
          >
            <Text className="text-[16px] font-bold text-white">선택 삭제</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/drive/other-expense/form",
                params: {
                  driveVehicleInfoId: params.driveVehicleInfoId ?? "",
                  baseDay: day?.baseDay ?? params.baseDay ?? "",
                },
              })
            }
            className="h-12 items-center justify-center rounded-lg bg-primary"
          >
            <Text className="text-[16px] font-bold text-white">기타내역 추가</Text>
          </Pressable>
        )}
      </View>

      <ConfirmDialog
        visible={deleteOpen}
        title="삭제"
        rightLabel="삭제"
        onLeft={() => setDeleteOpen(false)}
        onRight={onDelete}
      >
        <Text className="text-center text-[14px] text-gray700">
          선택한 {selected.length}건을 삭제하시겠습니까?
        </Text>
      </ConfirmDialog>
    </Screen>
  );
}
