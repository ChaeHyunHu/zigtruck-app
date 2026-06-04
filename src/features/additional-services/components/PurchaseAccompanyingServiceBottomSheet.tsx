import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { createPurchaseAccompanyingServices } from "@/src/api/AdditionalServices/createAdditionalServices";
import { showAppAlert } from "@/src/providers/appDialog";
import {
  BottomSheet,
  type BottomSheetRef,
  getDefaultBottomSheetHeight,
} from "@/src/components/common/BottomSheet";
import { BasicButton } from "@/src/components/common/BasicButton";
import { ConfirmDialog } from "@/src/components/common/ConfirmDialog";
import { appColors } from "@/src/constants/colors";
import { PurchaseAccompanyingGuideView } from "@/src/features/additional-services/components/PurchaseAccompanyingGuideView";
import { REPRESENTATIVE_NUMBER } from "@/src/features/additional-services/constants";
import { useMemberApplyFlag } from "@/src/features/additional-services/hooks/useMemberApplyFlag";
import {
  SERVICE_COMPLETED_BUTTON,
  SERVICE_PRIMARY_BUTTON,
} from "@/src/features/additional-services/serviceButtonStyles";
import type { SelectedVehicleInfo } from "@/src/features/additional-services/types";
import { useAuth } from "@/src/hooks/useAuth";
import { promptLogin } from "@/src/lib/authNavigation";

/** 상단 배경이 보이도록 바텀시트는 화면의 약 72%만 사용 */
const SHEET_HEIGHT = Math.min(getDefaultBottomSheetHeight(0.72), 640);

type PurchaseAccompanyingServiceBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  initialVehicle?: SelectedVehicleInfo;
};

export function PurchaseAccompanyingServiceBottomSheet({
  visible,
  onClose,
  initialVehicle,
}: PurchaseAccompanyingServiceBottomSheetProps) {
  const scrollRef = useRef<ScrollView>(null);
  const sheetModalRef = useRef<BottomSheetRef>(null);
  const dismissSheet = useCallback(() => sheetModalRef.current?.dismiss(), []);
  const { isAuthenticated, profile } = useAuth();
  const { isAlreadyApply, setIsAlreadyApply } = useMemberApplyFlag(
    "purchase-accompanying-service",
  );

  const [isNearBottom, setIsNearBottom] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const productId = initialVehicle?.productId;
  const truckName = initialVehicle?.truckName ?? "";

  useEffect(() => {
    if (!visible) {
      setIsNearBottom(false);
      setConfirmOpen(false);
    }
  }, [visible]);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } =
        event.nativeEvent;
      const paddingToBottom = 32;
      setIsNearBottom(
        layoutMeasurement.height + contentOffset.y >=
          contentSize.height - paddingToBottom,
      );
    },
    [],
  );

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
    setTimeout(() => setIsNearBottom(true), 350);
  }, []);

  const onPressPhone = useCallback(() => {
    Linking.openURL(`tel:${REPRESENTATIVE_NUMBER}`).catch(() => undefined);
  }, []);

  const onPressApply = useCallback(() => {
    if (!isAuthenticated) {
      promptLogin();
      return;
    }
    if (!profile?.name?.trim() || !profile?.phoneNumber?.trim()) {
      showAppAlert({
        title: "안내",
        message: "로그인 정보에서 이름·휴대폰 번호를 확인할 수 없습니다.",
      });
      return;
    }
    if (!productId) {
      showAppAlert({ title: "안내", message: "차량 정보가 없습니다." });
      return;
    }
    setConfirmOpen(true);
  }, [isAuthenticated, productId, profile?.name, profile?.phoneNumber]);

  const onConfirmApply = useCallback(async () => {
    if (!productId || !profile?.name || !profile?.phoneNumber) return;
    setConfirmOpen(false);
    setSubmitting(true);
    try {
      await createPurchaseAccompanyingServices({
        name: profile.name,
        phoneNumber: profile.phoneNumber,
        productId,
      });
      setIsAlreadyApply(true);
      showAppAlert({
        title: "완료",
        message: "차량 구매 동행 서비스를 신청했어요.",
        onConfirm: dismissSheet,
      });
    } catch (error: unknown) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String((error as { message?: string }).message)
          : "신청에 실패했습니다.";
      showAppAlert({ title: "오류", message });
    } finally {
      setSubmitting(false);
    }
  }, [
    dismissSheet,
    productId,
    profile?.name,
    profile?.phoneNumber,
    setIsAlreadyApply,
  ]);

  const footerLabel = isAlreadyApply
    ? isNearBottom
      ? "서비스 신청완료"
      : "아래로 내리기"
    : isNearBottom
      ? "서비스 신청하기"
      : "아래로 내리기";

  const footerButtonStyle =
    isAlreadyApply && isNearBottom
      ? SERVICE_COMPLETED_BUTTON
      : SERVICE_PRIMARY_BUTTON;

  return (
    <>
      <BottomSheet
        ref={sheetModalRef}
        visible={visible}
        onClose={onClose}
        sheetHeight={SHEET_HEIGHT}
        sheetStyle={{ backgroundColor: appColors.gray200 }}
      >
        <View className="flex-1 bg-gray200">
          <View className="flex-row items-center justify-center border-b border-gray300 bg-white px-4 py-3">
            <Text className="text-[17px] font-bold text-gray900">
              구매 동행 서비스
            </Text>
            <Pressable
              onPress={dismissSheet}
              hitSlop={8}
              className="absolute right-4 top-3"
            >
              <Ionicons name="close" size={24} color={appColors.gray900} />
            </Pressable>
          </View>

          <ScrollView
            ref={scrollRef}
            className="flex-1"
            onScroll={onScroll}
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            <PurchaseAccompanyingGuideView />
          </ScrollView>

          <View
            className="absolute bottom-0 left-0 right-0 border-t border-gray300 bg-gray200 px-4 pt-2"
            style={{ paddingBottom: 8 }}
          >
            <View className="absolute right-4 top-[-72px]">
              <Pressable
                onPress={onPressPhone}
                className="h-[52px] w-[52px] items-center justify-center rounded-full bg-white"
                style={{
                  shadowColor: "#000",
                  shadowOpacity: 0.12,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 4,
                }}
              >
                <Ionicons name="call" size={24} color={appColors.primary} />
              </Pressable>
            </View>
            <View className="absolute left-0 right-0 top-[-16px] h-4 bg-gray200 opacity-90" />
            <BasicButton
              name={footerLabel}
              bgColor={footerButtonStyle.backgroundColor}
              borderColor={footerButtonStyle.borderColor}
              textColor={footerButtonStyle.textColor}
              height={48}
              onClick={
                submitting
                  ? () => undefined
                  : isAlreadyApply
                    ? isNearBottom
                      ? () => undefined
                      : scrollToBottom
                    : isNearBottom
                      ? onPressApply
                      : scrollToBottom
              }
            />
          </View>
        </View>
      </BottomSheet>

      <ConfirmDialog
        visible={confirmOpen}
        title={truckName || undefined}
        leftLabel="취소"
        rightLabel="신청하기"
        onLeft={() => setConfirmOpen(false)}
        onRight={submitting ? undefined : onConfirmApply}
      >
        <Text className="text-center text-[16px] leading-[24px] text-gray800">
          해당 차량으로 차량 구매 동행{"\n"}서비스를 신청할까요?
        </Text>
      </ConfirmDialog>
    </>
  );
}
