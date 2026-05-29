import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  type ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BasicButton } from "@/src/components/common/BasicButton";
import { KeyboardAwareScrollView } from "@/src/components/common/KeyboardAwareScrollView";
import { Screen } from "@/src/components/common/Screen";
import { appColors } from "@/src/constants/colors";

import { REPRESENTATIVE_NUMBER } from "../constants";

type ServiceScreenLayoutProps = {
  title: string;
  children: React.ReactNode;
  footerBgClassName?: string;
  applyLabel: string;
  completedLabel: string;
  isAlreadyApply: boolean;
  isSubmitDisabled: boolean;
  onPressApply: () => void;
};

export function ServiceScreenLayout({
  title,
  children,
  footerBgClassName = "bg-white",
  applyLabel,
  completedLabel,
  isAlreadyApply,
  isSubmitDisabled,
  onPressApply,
}: ServiceScreenLayoutProps) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [isNearBottom, setIsNearBottom] = useState(false);

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 24;
    const nearBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    setIsNearBottom(nearBottom);
  }, []);

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, []);

  const onPressMainButton = useCallback(() => {
    if (isAlreadyApply) return;
    if (isNearBottom) {
      onPressApply();
      return;
    }
    scrollToBottom();
  }, [isAlreadyApply, isNearBottom, onPressApply, scrollToBottom]);

  const onPressCall = useCallback(() => {
    Linking.openURL(`tel:${REPRESENTATIVE_NUMBER}`).catch(() => undefined);
  }, []);

  const buttonLabel = isAlreadyApply
    ? completedLabel
    : isNearBottom
      ? applyLabel
      : "아래로 내리기";

  const buttonDisabled =
    isAlreadyApply || (isNearBottom && isSubmitDisabled);

  return (
    <Screen variant="stack" className="flex-1 bg-white">
      <View className="h-[52px] flex-row items-center border-b border-gray300 px-4">
        <Pressable onPress={() => router.back()} hitSlop={8} className="mr-2">
          <Ionicons name="chevron-back" size={26} color={appColors.gray900} />
        </Pressable>
        <Text className="text-[16px] font-semibold text-gray900">{title}</Text>
      </View>

      <KeyboardAwareScrollView
        ref={scrollRef}
        className="flex-1"
        footerInset={120}
        restingBottomPadding={insets.bottom}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {children}
      </KeyboardAwareScrollView>

      <View
        className={`absolute bottom-0 left-0 right-0 border-t border-gray200 px-4 pt-2 ${footerBgClassName}`}
        style={{ paddingBottom: Math.max(insets.bottom, 8) }}
      >
        <Pressable
          className="absolute right-4 top-[-68px] h-[52px] w-[52px] items-center justify-center rounded-full bg-white"
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.12,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 4,
          }}
          onPress={onPressCall}
        >
          <Ionicons name="call-outline" size={24} color={appColors.primary} />
        </Pressable>

        <View pointerEvents={buttonDisabled ? "none" : "auto"} style={{ opacity: buttonDisabled ? 0.5 : 1 }}>
          <BasicButton
            name={buttonLabel}
            bgColor={appColors.primary}
            borderColor={appColors.primary}
            textColor={appColors.white}
            fontSize={16}
            height={48}
            fontWeight="bold"
            borderRadius={8}
            onClick={onPressMainButton}
          />
        </View>
      </View>
    </Screen>
  );
}
