import { Ionicons } from "@expo/vector-icons";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { LoginRequiredView } from "@/src/components/auth/LoginRequiredView";
import React, { useCallback, useMemo } from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { BasicButton } from "@/src/components/common/BasicButton";
import { Screen } from "@/src/components/common/Screen";
import { showAppAlert } from "@/src/providers/appDialog";
import { appColors } from "@/src/constants/colors";
import {
  PRODUCT_TYPE_DIRECT,
  PRODUCT_TYPE_SPEED,
  SALESTYPE,
} from "@/src/constants/products";
import { DirectGuide } from "@/src/features/sell-car/DirectGuide";
import { SpeedGuide } from "@/src/features/sell-car/SpeedGuide";
import { useAuth } from "@/src/hooks/useAuth";

type SalesTypeKey = keyof typeof SALESTYPE;

export default function SellCarGuideScreen() {
  const { type } = useLocalSearchParams<{ type?: string }>();
  const { isAuthenticated } = useAuth();

  const salesType = useMemo(() => {
    if (type === PRODUCT_TYPE_DIRECT || type === PRODUCT_TYPE_SPEED) {
      return type as SalesTypeKey;
    }
    return null;
  }, [type]);

  const buttonLabel =
    salesType === PRODUCT_TYPE_DIRECT
      ? "직거래 판매 등록"
      : salesType === PRODUCT_TYPE_SPEED
        ? "직트럭에 즉시 판매 등록"
        : "판매 등록";

  const onPressRegister = useCallback(() => {
    router.push({
      pathname: "/products/sales",
      params: { type: salesType ?? PRODUCT_TYPE_DIRECT },
    });
  }, [salesType]);

  const onPressCall = useCallback(() => {
    Linking.openURL("tel:15996249").catch(() =>
      showAppAlert({ title: "전화 문의", message: "1599-6249" }),
    );
  }, []);

  if (!isAuthenticated) {
    return (
      <Screen variant="stack" className="flex-1 bg-white">
        <View className="h-[52px] flex-row items-center border-b border-gray300 px-4">
          <Pressable onPress={() => router.back()} hitSlop={8} className="mr-2">
            <Ionicons name="chevron-back" size={26} color={appColors.gray900} />
          </Pressable>
          <Text className="text-[16px] font-semibold text-gray900">판매 안내</Text>
        </View>
        <LoginRequiredView message="판매 등록은 로그인 후 이용할 수 있습니다." />
      </Screen>
    );
  }

  if (!salesType) {
    return <Redirect href="/sell-car" />;
  }

  return (
    <Screen variant="stack" className="flex-1 bg-white">
      <View className="h-[52px] flex-row items-center border-b border-gray300 px-4">
        <Pressable onPress={() => router.back()} hitSlop={8} className="mr-2">
          <Ionicons name="chevron-back" size={26} color={appColors.gray900} />
        </Pressable>
        <Text className="flex-1 text-[16px] font-semibold text-gray900" numberOfLines={1}>
          {SALESTYPE[salesType]}
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 16 }}>
        {salesType === PRODUCT_TYPE_DIRECT ? <DirectGuide /> : <SpeedGuide />}
      </ScrollView>

      {salesType === PRODUCT_TYPE_SPEED ? (
        <Pressable
          className="absolute bottom-[76px] right-4 h-[52px] w-[52px] items-center justify-center rounded-full border border-gray300 bg-white"
          onPress={onPressCall}
        >
          <Ionicons name="call-outline" size={24} color={appColors.primary} />
        </Pressable>
      ) : null}

      <View className="border-t border-gray300 bg-white px-4 pt-3">
        <BasicButton
          name={buttonLabel}
          bgColor={appColors.primary}
          borderColor={appColors.primary}
          textColor={appColors.white}
          fontSize={16}
          height={48}
          fontWeight="bold"
          borderRadius={8}
          onClick={onPressRegister}
        />
      </View>
    </Screen>
  );
}
