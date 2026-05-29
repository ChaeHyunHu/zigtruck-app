import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";

import { deleteLicense } from "@/src/api/license/deleteLicense";
import { updateLicense } from "@/src/api/license/updateLicense";
import { ConfirmDialog } from "@/src/components/common/ConfirmDialog";
import { MenuBottomSheet } from "@/src/components/common/MenuBottomSheet";
import { appColors } from "@/src/constants/colors";
import { formatNumberWithComma } from "@/src/features/home/utils";
import { LicenseStatusBadge } from "@/src/features/license/components/LicenseStatusBadge";
import {
  buildLicenseMenuItems,
  LICENSE_STATUS_COMPLETED,
  LICENSE_STATUS_PAUSE,
  LICENSE_STATUS_SALE,
  resolveLicenseDisplayStatus,
} from "@/src/features/license/licenseStatus";
import type { LicenseItem } from "@/src/features/license/types";

type Props = {
  item: LicenseItem;
  onChanged?: () => void;
};

export function LicenseMyListCard({ item, onChanged }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const displayStatus = resolveLicenseDisplayStatus(item);
  const salesCode = item.licenseSalesType?.code ?? "";
  const salesColor = salesCode === "TRADE" ? "text-[#2f6fd6]" : "text-[#e04b4b]";

  const title = `${item.tons}톤 ${item.year}년 ${item.licenseType?.desc ?? ""}`;

  const onMenuAction = useCallback((code: string) => {
    switch (code) {
      case "MODIFY":
        Alert.alert("안내", "번호판 수정은 준비 중입니다.");
        return;
      case "DELETE":
        setPendingAction("DELETE");
        setConfirmOpen(true);
        return;
      case "COMPLETED":
        setPendingAction("COMPLETED");
        setConfirmOpen(true);
        return;
      case "PAUSE":
      case "SALE":
        patchStatus(code);
        return;
      default:
        return;
    }
  }, [item.id, onChanged, title]);

  const menuItems = useMemo(
    () =>
      buildLicenseMenuItems(item.status?.code).map((action) => ({
        label: action.label,
        onPress: () => onMenuAction(action.code),
      })),
    [item.status?.code, onMenuAction],
  );

  const patchStatus = async (status: string) => {
    try {
      setBusy(true);
      await updateLicense({ id: item.id, status });
      onChanged?.();
      const msg =
        status === LICENSE_STATUS_SALE
          ? "판매중으로 변경되었어요."
          : status === LICENSE_STATUS_PAUSE
            ? "판매중지로 변경되었어요."
            : status === LICENSE_STATUS_COMPLETED
              ? "판매완료로 변경되었어요."
              : "상태가 변경되었어요.";
      Alert.alert("완료", msg);
    } catch {
      Alert.alert("오류", "상태 변경에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  };

  const onConfirm = async () => {
    if (!pendingAction) return;
    if (pendingAction === "DELETE") {
      try {
        setBusy(true);
        await deleteLicense({ id: item.id, isSoftDelete: true });
        onChanged?.();
        Alert.alert("완료", "번호판이 삭제되었어요.");
      } catch {
        Alert.alert("오류", "삭제에 실패했습니다.");
      } finally {
        setBusy(false);
        setConfirmOpen(false);
        setPendingAction(null);
      }
      return;
    }
    if (pendingAction === "COMPLETED") {
      setConfirmOpen(false);
      setPendingAction(null);
      await patchStatus(LICENSE_STATUS_COMPLETED);
    }
  };

  const confirmTitle =
    pendingAction === "DELETE"
      ? `${title}`
      : "판매 완료로 상태를 변경할까요?";

  const confirmBody =
    pendingAction === "DELETE" ? (
      <Text className="text-center text-[14px] text-gray700">
        번호판을 정말 삭제하시겠어요?
      </Text>
    ) : (
      <View>
        <Text className="text-center text-[14px] text-gray700">
          판매 완료 처리 후 판매중으로{"\n"}상태 변경이 불가능합니다.
        </Text>
        <Text className="mt-3 text-center text-[13px] text-danger">
          * 판매완료 처리 후 판매중으로 상태 변경이 불가능합니다.
        </Text>
      </View>
    );

  return (
    <>
      <View className="rounded-xl border border-gray300 bg-white p-4">
        <View className="mb-3 flex-row items-start justify-between">
          <LicenseStatusBadge status={displayStatus} />
          <Pressable
            hitSlop={8}
            disabled={busy}
            onPress={() => setMenuOpen(true)}
          >
            <Ionicons
              name="ellipsis-vertical"
              size={22}
              color={appColors.gray700}
            />
          </Pressable>
        </View>

        <Text className="text-[17px] font-bold text-gray900">{title}</Text>

        <View className="mt-3 gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-[15px] text-gray700">거래 방식</Text>
            <Text className={`text-[15px] font-bold ${salesColor}`}>
              {item.licenseSalesType?.desc ?? "-"}
            </Text>
          </View>
          {salesCode === "TRADE" ? (
            <View className="flex-row items-center justify-between">
              <Text className="text-[15px] text-gray700">번호판 종류</Text>
              <Text className="flex-1 text-right text-[15px] font-medium text-gray900">
                {item.licenseType?.desc ?? "-"}
              </Text>
            </View>
          ) : (
            <>
              <View className="flex-row items-center justify-between">
                <Text className="text-[15px] text-gray700">보험요율</Text>
                <Text className="text-[15px] font-medium text-gray900">
                  {item.insuranceRate ?? "-"}%
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-[15px] text-gray700">지입료</Text>
                <Text className="text-[15px] font-medium text-gray900">
                  {formatNumberWithComma(item.fee)}만원
                </Text>
              </View>
            </>
          )}
          <View className="flex-row items-center justify-between border-t border-gray300 pt-4">
            <Text className="text-[15px] text-gray700">가격</Text>
            <Text className="text-[15px] font-bold text-gray900">
              {formatNumberWithComma(item.price)}만원
            </Text>
          </View>
        </View>
      </View>

      <MenuBottomSheet
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        title="메뉴"
        items={menuItems}
      />

      <ConfirmDialog
        visible={confirmOpen}
        title={confirmTitle}
        leftLabel="닫기"
        rightLabel={pendingAction === "DELETE" ? "삭제하기" : "확인"}
        onLeft={() => {
          setConfirmOpen(false);
          setPendingAction(null);
        }}
        onRight={onConfirm}
      >
        {confirmBody}
      </ConfirmDialog>
    </>
  );
}
