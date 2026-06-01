import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect } from "react";
import { BackHandler, Pressable, Text, View } from "react-native";

import { appColors } from "@/src/constants/colors";
import { useRegistrationExitGuardOptional } from "@/src/features/sell-car/registration/RegistrationExitGuard";

type RegistrationHeaderProps = {
  title: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  /** true면 뒤로가기 시 등록 나가기 확인 모달 표시 (내차판매 등록 플로우) */
  exitConfirmOnBack?: boolean;
};

export const RegistrationHeader = React.memo(function RegistrationHeader({
  title,
  onBack,
  rightElement,
  exitConfirmOnBack = false,
}: RegistrationHeaderProps) {
  const exitGuard = useRegistrationExitGuardOptional();
  const useExitConfirm = exitConfirmOnBack && exitGuard != null;

  const handleBack = useCallback(() => {
    if (useExitConfirm) {
      exitGuard.requestExit();
      return;
    }
    if (onBack) {
      onBack();
      return;
    }
    router.back();
  }, [exitGuard, onBack, useExitConfirm]);

  useEffect(() => {
    if (!useExitConfirm || exitGuard.isExitConfirmVisible) return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      exitGuard.requestExit();
      return true;
    });
    return () => subscription.remove();
  }, [exitGuard, useExitConfirm]);

  return (
    <View className="h-[52px] flex-row items-center border-b border-gray300 px-4">
      <Pressable onPress={handleBack} hitSlop={8} className="mr-2">
        <Ionicons name="chevron-back" size={26} color={appColors.gray900} />
      </Pressable>
      <Text className="flex-1 text-[16px] font-semibold text-gray900" numberOfLines={1}>
        {title}
      </Text>
      {rightElement}
    </View>
  );
});
