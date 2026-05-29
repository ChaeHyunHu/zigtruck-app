import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  createCapitalCounselServices,
  createTransferAgencyServices,
} from "@/src/api/AdditionalServices/createAdditionalServices";
import {
  BottomSheet,
  type BottomSheetRef,
  getDefaultBottomSheetHeight,
} from "@/src/components/common/BottomSheet";
import { BasicButton } from "@/src/components/common/BasicButton";
import { ConfirmDialog } from "@/src/components/common/ConfirmDialog";
import { CapitalGuideView } from "@/src/features/additional-services/components/CapitalGuideView";
import { TransferGuideView } from "@/src/features/additional-services/components/TransferGuideView";
import { REPRESENTATIVE_NUMBER } from "@/src/features/additional-services/constants";
import { useMemberApplyFlag } from "@/src/features/additional-services/hooks/useMemberApplyFlag";
import type { AdditionalServiceType } from "@/src/features/additional-services/constants";
import { appColors } from "@/src/constants/colors";
import { useAuth } from "@/src/hooks/useAuth";
import { promptLogin } from "@/src/lib/authNavigation";

/** 구매동행서비스와 동일하게 상단 배경이 보이도록 약 72% 높이 */
const SHEET_HEIGHT = Math.min(getDefaultBottomSheetHeight(0.72), 640);

export type ProductDetailServiceSheetKind = "capital" | "transfer" | null;

type ProductDetailServiceBottomSheetProps = {
  kind: ProductDetailServiceSheetKind;
  onClose: () => void;
  productId: number;
  truckName?: string;
  price?: number | null;
};

const SHEET_CONFIG: Record<
  Exclude<ProductDetailServiceSheetKind, null>,
  {
    serviceType: AdditionalServiceType;
    title: string;
    applyLabel: string;
    completedLabel: string;
    successMessage: string;
    confirmBody: string;
  }
> = {
  capital: {
    serviceType: "capital-counsel-service",
    title: "화물차 대출 상담 서비스",
    applyLabel: "한도 조회 신청하기",
    completedLabel: "한도 조회 신청완료",
    successMessage: "화물차 대출 상담 서비스를 신청했어요.",
    confirmBody: "해당 차량으로 화물차 대출 상담\n서비스를 신청할까요?",
  },
  transfer: {
    serviceType: "transfer-agency-service",
    title: "서류 이전 대행 서비스",
    applyLabel: "서비스 신청하기",
    completedLabel: "서비스 신청완료",
    successMessage: "서류 이전 대행 서비스를 신청했어요.",
    confirmBody: "해당 차량으로 서류 이전 대행\n서비스를 신청할까요?",
  },
};

export function ProductDetailServiceBottomSheet({
  kind,
  onClose,
  productId,
  truckName = "",
  price,
}: ProductDetailServiceBottomSheetProps) {
  const lastKindRef = useRef<Exclude<ProductDetailServiceSheetKind, null>>(null);
  if (kind) {
    lastKindRef.current = kind;
  }
  const sheetKind = kind ?? lastKindRef.current;
  const visible = kind != null;
  const config = sheetKind ? SHEET_CONFIG[sheetKind] : null;

  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const sheetModalRef = useRef<BottomSheetRef>(null);
  const dismissSheet = useCallback(() => sheetModalRef.current?.dismiss(), []);
  const { isAuthenticated, profile } = useAuth();
  const capitalApply = useMemberApplyFlag("capital-counsel-service");
  const transferApply = useMemberApplyFlag("transfer-agency-service");
  const { isAlreadyApply, setIsAlreadyApply } =
    sheetKind === "transfer" ? transferApply : capitalApply;

  const [isNearBottom, setIsNearBottom] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) {
      setIsNearBottom(false);
      setConfirmOpen(false);
    }
  }, [visible]);

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 32;
    setIsNearBottom(
      layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom,
    );
  }, []);

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
      Alert.alert("안내", "로그인 정보에서 이름·휴대폰 번호를 확인할 수 없습니다.");
      return;
    }
    setConfirmOpen(true);
  }, [isAuthenticated, profile?.name, profile?.phoneNumber]);

  const onConfirmApply = useCallback(async () => {
    if (!sheetKind || !config || !profile?.name || !profile?.phoneNumber) return;
    setConfirmOpen(false);
    setSubmitting(true);
    try {
      const payload = {
        name: profile.name,
        phoneNumber: profile.phoneNumber,
        productId,
      };
      if (sheetKind === "capital") {
        await createCapitalCounselServices(payload);
      } else {
        await createTransferAgencyServices(payload);
      }
      setIsAlreadyApply(true);
      Alert.alert("완료", config.successMessage, [
        { text: "확인", onPress: dismissSheet },
      ]);
    } catch (error: unknown) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String((error as { message?: string }).message)
          : "신청에 실패했습니다.";
      Alert.alert("오류", message);
    } finally {
      setSubmitting(false);
    }
  }, [
    config,
    dismissSheet,
    productId,
    profile?.name,
    profile?.phoneNumber,
    setIsAlreadyApply,
    sheetKind,
  ]);

  if (!sheetKind || !config) return null;

  const footerLabel = isAlreadyApply
    ? config.completedLabel
    : isNearBottom
      ? config.applyLabel
      : "아래로 내리기";

  return (
    <>
      <BottomSheet
        ref={sheetModalRef}
        visible={visible}
        onClose={onClose}
        sheetHeight={SHEET_HEIGHT}
        sheetStyle={{ backgroundColor: "#f5f5f5" }}
      >
          <View className="flex-1 bg-gray200">
            <View className="flex-row items-center justify-center border-b border-gray300 bg-white px-4 py-3">
              <Text className="text-[17px] font-bold text-gray900">{config.title}</Text>
              <Pressable onPress={dismissSheet} hitSlop={8} className="absolute right-4 top-3">
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
              {sheetKind === "capital" ? (
                <CapitalGuideView price={price ?? 0} isPopup />
              ) : (
                <TransferGuideView />
              )}
            </ScrollView>

            <View
              className="absolute bottom-0 left-0 right-0 border-t border-gray300 bg-white px-4 pt-2"
              style={{ paddingBottom: Math.max(insets.bottom, 8) + 10 }}
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
              <View
                className="absolute left-0 right-0 top-[-16px] h-4"
                style={{ backgroundColor: "rgba(255,255,255,0.95)" }}
              />
              <BasicButton
                name={footerLabel}
                bgColor={isAlreadyApply ? appColors.gray400 : appColors.primary}
                borderColor={isAlreadyApply ? appColors.gray400 : appColors.primary}
                textColor="#ffffff"
                height={48}
                onClick={
                  isAlreadyApply || submitting
                    ? () => undefined
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
          {config.confirmBody}
        </Text>
      </ConfirmDialog>
    </>
  );
}
