import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { appColors } from "@/src/constants/colors";

export const OneStopServiceBanner = React.memo(function OneStopServiceBanner() {
  return (
    <Pressable
      className="mx-4 mt-6 flex-row items-center justify-between rounded-lg bg-gray100 px-4 py-4"
      onPress={() => router.push("/one-stop-service")}
    >
      <View className="flex-1 flex-row items-center">
        <Ionicons name="headset-outline" size={28} color={appColors.gray700} />
        <View className="ml-2 flex-1">
          <Text className="text-[11px] font-medium text-gray600">
            차량 판매에 어려움이 있으신가요?
          </Text>
          <Text className="mt-1 text-[16px] font-bold text-gray800">
            위탁판매 서비스 신청하기
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={appColors.gray600} />
    </Pressable>
  );
});
