import React from "react";
import { Pressable, Text, View } from "react-native";

import { appColors } from "@/src/constants/colors";
import { navigateToLogin } from "@/src/lib/authNavigation";

type LoginRequiredViewProps = {
  message?: string;
};

export function LoginRequiredView({
  message = "로그인 후 이용 가능한 메뉴입니다.",
}: LoginRequiredViewProps) {
  return (
    <View className="flex-1 items-center justify-center gap-3 px-6">
      <Text className="text-center text-[15px] text-gray700">{message}</Text>
      <Pressable
        className="h-11 items-center justify-center rounded-[10px] bg-primary px-[18px]"
        onPress={navigateToLogin}
      >
        <Text className="text-[15px] font-bold text-white">로그인 하러가기</Text>
      </Pressable>
    </View>
  );
}
