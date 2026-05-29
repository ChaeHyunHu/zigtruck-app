import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback } from "react";
import { Alert, Pressable, Text, View } from "react-native";

import { LoginRequiredView } from "@/src/components/auth/LoginRequiredView";
import { Screen } from "@/src/components/common/Screen";
import { appColors } from "@/src/constants/colors";
import { PRODUCT_TYPE_DIRECT, PRODUCT_TYPE_SPEED } from "@/src/constants/products";
import { SalesTypeSelectButton } from "@/src/features/sell-car/SalesTypeSelectButton";
import { useAuth } from "@/src/hooks/useAuth";

export default function SellCarMainScreen() {
  const { isAuthenticated } = useAuth();

  const onPressSalesType = useCallback((type: string) => {
    router.push({
      pathname: "/sell-car/guide",
      params: { type },
    });
  }, []);

  const onPressSaleHelp = useCallback(() => {
    router.push("/one-stop-service");
  }, []);

  return (
    <Screen variant="stack" className="flex-1 bg-white">
      <View className="h-[52px] flex-row items-center border-b border-gray300 px-4">
        <Pressable onPress={() => router.back()} hitSlop={8} className="mr-2">
          <Ionicons name="chevron-back" size={26} color={appColors.gray900} />
        </Pressable>
        <Text className="text-[16px] font-semibold text-gray900">내차판매</Text>
      </View>

      {!isAuthenticated ? (
        <LoginRequiredView message="내차판매는 로그인 후 이용할 수 있습니다." />
      ) : (
      <View className="flex-1 pt-6">
        <Text className="px-4 text-[30px] font-bold leading-[39px] text-gray800">
          판매 방식을{"\n"}선택해주세요
        </Text>

        <SalesTypeSelectButton
          onPressDirect={() => onPressSalesType(PRODUCT_TYPE_DIRECT)}
          onPressSpeed={() => onPressSalesType(PRODUCT_TYPE_SPEED)}
        />

        <Pressable className="mt-[30px] items-center px-4" onPress={onPressSaleHelp}>
          <Text className="text-[14px] font-medium text-gray700 underline underline-offset-2">
            차량 판매에 어려움이 있으신가요?
          </Text>
        </Pressable>
      </View>
      )}
    </Screen>
  );
}
