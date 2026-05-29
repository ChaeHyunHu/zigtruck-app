import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

type Props = {
  onPressPurchase: () => void;
  onPressSales: () => void;
};

export function LicenseActionCards({ onPressPurchase, onPressSales }: Props) {
  return (
    <View className="flex-row gap-3">
      <Pressable
        onPress={onPressPurchase}
        className="min-h-[120px] flex-1 rounded-xl border border-[#7eb8ff] bg-[#eef5ff] p-4"
      >
        <Text className="text-[17px] font-bold leading-[22px] text-gray900">
          번호판{"\n"}
          <Text className="text-[#2f6fd6]">구매문의 </Text>
          남기기
        </Text>
        <Text className="mt-2 text-[11px] font-medium leading-[14px] text-gray700">
          찾고있는 번호판이 없다면{"\n"}문의를 남겨주세요.
        </Text>
        <View className="mt-2 items-end">
          <Ionicons name="search" size={36} color="#2f6fd6" />
        </View>
      </Pressable>
      <Pressable
        onPress={onPressSales}
        className="min-h-[120px] flex-1 rounded-xl border border-[#f5a8a8] bg-[#fff0f0] p-4"
      >
        <Text className="text-[17px] font-bold leading-[22px] text-gray900">
          번호판{"\n"}
          <Text className="text-[#e04b4b]">판매하러 </Text>
          가기
        </Text>
        <Text className="mt-2 text-[11px] font-medium leading-[14px] text-gray700">
          직트럭에서 쉽고 빠르게{"\n"}번호판 판매하기
        </Text>
        <View className="mt-2 items-end">
          <Ionicons name="cash-outline" size={36} color="#e04b4b" />
        </View>
      </Pressable>
    </View>
  );
}
