import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { ConfirmDialog } from "@/src/components/common/ConfirmDialog";
import { showAppAlert } from "@/src/providers/appDialog";
import { appColors } from "@/src/constants/colors";
import type { InterestNotificationSettingItem } from "@/src/features/interest-notification-settings/types";
import { buildSettingCardRows } from "@/src/features/interest-notification-settings/utils";

type InterestProductSettingCardProps = {
  item: InterestNotificationSettingItem;
  onEdit: () => void;
  onDelete: () => Promise<void>;
};

export function InterestProductSettingCard({
  item,
  onEdit,
  onDelete,
}: InterestProductSettingCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const rows = buildSettingCardRows(item);

  const handleDelete = async () => {
    setConfirmOpen(false);
    try {
      await onDelete();
    } catch {
      showAppAlert({ title: "오류", message: "삭제에 실패했습니다." });
    }
  };

  return (
    <>
      <View className="mx-4 mb-4 rounded-lg border border-gray300 bg-white p-4">
        {rows.map((row) => (
          <View key={row.label} className="mb-3 flex-row items-start">
            <Text className="w-[90px] shrink-0 text-[14px] text-gray700">{row.label}</Text>
            <Text className="flex-1 text-right text-[14px] text-gray900">{row.value}</Text>
          </View>
        ))}
        <View className="mt-2 flex-row gap-2">
          <Pressable
            onPress={onEdit}
            className="h-10 flex-1 items-center justify-center rounded-lg border border-gray400 bg-white"
          >
            <Text className="text-[16px] font-semibold text-gray600">수정</Text>
          </Pressable>
          <Pressable
            onPress={() => setConfirmOpen(true)}
            className="h-10 flex-1 items-center justify-center rounded-lg bg-primary"
          >
            <Text className="text-[16px] font-semibold text-white">삭제</Text>
          </Pressable>
        </View>
      </View>

      <ConfirmDialog
        visible={confirmOpen}
        onLeft={() => setConfirmOpen(false)}
        leftLabel="취소"
        rightLabel="삭제"
        onRight={() => void handleDelete()}
      >
        <Text className="text-center text-[15px] leading-6 text-gray800">
          관심 차량 알림을{"\n"}삭제할까요?
        </Text>
      </ConfirmDialog>
    </>
  );
}
