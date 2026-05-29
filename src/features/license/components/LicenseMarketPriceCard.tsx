import React from "react";
import { Text, View } from "react-native";

import { formatPrice } from "@/src/features/home/utils";
import type { LicensePriceData } from "@/src/api/license";

type Props = { data: LicensePriceData | null };

export function LicenseMarketPriceCard({ data }: Props) {
  return (
    <View className="overflow-hidden rounded-xl border border-gray300 bg-white">
      <View className="items-center bg-primary py-2.5">
        <Text className="text-[17px] font-bold text-white">이달의 시세</Text>
      </View>
      <View className="border-b border-gray300 px-4 py-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-[15px] text-gray700">개인개별</Text>
          <Text className="text-[15px] font-semibold text-gray900">
            {formatPrice(data?.individualStartPrice)} ~{" "}
            {formatPrice(data?.individualEndPrice)}
          </Text>
        </View>
      </View>
      <View className="px-4 py-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-[15px] text-gray700">개인용달</Text>
          <Text className="text-[15px] font-semibold text-gray900">
            {formatPrice(data?.cargoStartPrice)} ~{" "}
            {formatPrice(data?.cargoEndPrice)}
          </Text>
        </View>
      </View>
    </View>
  );
}
