import React, { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";

import { ConfirmDialog } from "@/src/components/common/ConfirmDialog";
import { formatNumberWithComma } from "@/src/features/home/utils";
import { postLicenseItemPurchaseRequest } from "@/src/api/license";
import type { LicenseItem } from "@/src/features/license/types";
import { useAuth } from "@/src/hooks/useAuth";
import { promptLogin } from "@/src/lib/authNavigation";

type Props = {
  item: LicenseItem;
  onRequested?: () => void;
};

export function LicenseListCard({ item, onRequested }: Props) {
  const { isAuthenticated, memberId } = useAuth();
  const [requested, setRequested] = useState(Boolean(item.requested));
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const salesCode = item.licenseSalesType?.code ?? "";
  const salesColor = salesCode === "TRADE" ? "text-[#2f6fd6]" : "text-[#e04b4b]";
  const isCompleted = item.status?.code === "COMPLETED";
  const showPrice = !isCompleted;
  const showPurchaseButton = !isCompleted && !item.isMyLicense;

  const onPressRequest = () => {
    if (!isAuthenticated) {
      promptLogin();
      return;
    }
    setConfirmOpen(true);
  };

  const onConfirmRequest = async () => {
    if (!memberId) return;
    try {
      setSubmitting(true);
      await postLicenseItemPurchaseRequest({
        licenseId: item.id,
        memberId: Number(memberId),
      });
      setRequested(true);
      setConfirmOpen(false);
      onRequested?.();
      Alert.alert("완료", "번호판 구매를 요청했어요.");
    } catch {
      Alert.alert("오류", "구매 요청에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <View className="rounded-xl border border-gray300 bg-white p-4">
        {isCompleted ? (
          <View className="mb-3 self-start rounded-lg bg-gray800 px-2.5 py-1">
            <Text className="text-[13px] font-semibold text-white">거래완료</Text>
          </View>
        ) : null}
        <Text className="text-[17px] font-bold text-gray900">
          {item.tons}톤 {item.year}년 {item.licenseType?.desc ?? ""}
        </Text>

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
          {showPrice ? (
            <View className="flex-row items-center justify-between border-t border-gray300 pt-4">
              <Text className="text-[15px] text-gray700">가격</Text>
              <Text className="text-[15px] font-bold text-gray900">
                {formatNumberWithComma(item.price)}만원
              </Text>
            </View>
          ) : null}
        </View>

        {showPurchaseButton ? (
          <Pressable
            disabled={requested || submitting}
            onPress={onPressRequest}
            className={`mt-3 h-11 items-center justify-center rounded-lg border ${
              requested
                ? "border-gray300 bg-gray200"
                : "border-gray400 bg-gray100"
            }`}
          >
            <Text
              className={`text-[15px] font-semibold ${
                requested ? "text-gray600" : "text-gray800"
              }`}
            >
              {requested ? "구매 요청 완료" : "구매 요청"}
            </Text>
          </Pressable>
        ) : null}
      </View>

      <ConfirmDialog
        visible={confirmOpen}
        title={`${item.tons}톤 ${item.year}년 ${item.licenseType?.desc ?? ""}을 구매 요청할까요?`}
        leftLabel="닫기"
        rightLabel="확인"
        onLeft={() => setConfirmOpen(false)}
        onRight={onConfirmRequest}
      >
        <Text className="text-center text-[14px] text-gray700">
          번호판 구매 요청 시 담당자가{"\n"}확인 후 연락드릴 예정입니다.
        </Text>
      </ConfirmDialog>
    </>
  );
}
