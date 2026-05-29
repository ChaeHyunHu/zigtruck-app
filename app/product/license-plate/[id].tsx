import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { Screen } from "@/src/components/common/Screen";

export default function LicensePlateScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Screen className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <View className="h-14 flex-row items-center border-b border-gray300 px-4">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </Pressable>
        <Text className="ml-3 text-[18px] font-bold text-gray900">
          번호판 관리
        </Text>
      </View>

      <View className="flex-1 items-center justify-center px-6">
        <Ionicons name="car-outline" size={64} color="#bdbdbd" />
        <Text className="mt-4 text-[15px] font-bold text-gray900">
          번호판 관리 (준비중)
        </Text>
        <Text className="mt-2 text-center text-[13px] text-gray700">
          상품 ID {id}의 번호판 등록·해제·이전 기능은 곧 제공됩니다.
        </Text>
      </View>
    </Screen>
  );
}
