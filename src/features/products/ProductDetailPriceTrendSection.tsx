import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Pressable, Text, View } from "react-native";

import { CarPriceTrendInfoView } from "@/src/features/price-trend/CarPriceTrendInfoView";
import { buildPriceSearchParamsFromProductDetail } from "@/src/features/price-trend/utils";
import { showAppAlert } from "@/src/providers/appDialog";

import type { ProductDetail } from "./types";

const PRICE_TREND_TOOLTIP =
  "* 톤수별 평균 키로수 (영업용 기준)\n" +
  "1. 14~25톤 (1년 기준 10만내외)\n" +
  "2. 4.5톤 (1년 기준 8만km내외)\n" +
  "3. 2.5~3.5톤 (1년 기준 6만km 내외)\n" +
  "4. 1톤 (1년 기준 4만km내외)";

type ProductDetailPriceTrendSectionProps = {
  detail: ProductDetail;
};

export function ProductDetailPriceTrendSection({
  detail,
}: ProductDetailPriceTrendSectionProps) {
  const searchParams = useMemo(
    () => buildPriceSearchParamsFromProductDetail(detail),
    [detail],
  );

  return (
    <View className="border-t-8 border-gray100 px-4 pt-4">
      <View className="mb-1 flex-row items-center">
        <Text className="text-[18px] font-semibold text-gray900">
          직거래 시세 정보
        </Text>
        <Pressable
          onPress={() => showAppAlert({ title: "직거래 시세 정보", message: PRICE_TREND_TOOLTIP })}
          hitSlop={8}
          className="ml-1"
        >
          <Ionicons name="information-circle-outline" size={20} color="#9e9e9e" />
        </Pressable>
      </View>
      <CarPriceTrendInfoView
        searchParams={searchParams}
        apiType="public"
        showPriceComparison
        price={detail.price}
      />
    </View>
  );
}
