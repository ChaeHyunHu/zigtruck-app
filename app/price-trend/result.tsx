import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Screen } from "@/src/components/common/Screen";
import { PRODUCT_TYPE_DIRECT } from "@/src/constants/products";
import { CarPriceTrendInfoView } from "@/src/features/price-trend/CarPriceTrendInfoView";
import type { PriceTrendOriginData, ProductSearchParams } from "@/src/features/price-trend/types";
import { RegistrationHeader } from "@/src/features/sell-car/registration/RegistrationHeader";

export default function PriceTrendResultScreen() {
  const params = useLocalSearchParams<{
    searchParams?: string;
    originData?: string;
    ownerName?: string;
  }>();

  const searchParams = useMemo(() => {
    if (!params.searchParams) return null;
    try {
      return JSON.parse(params.searchParams) as ProductSearchParams;
    } catch {
      return null;
    }
  }, [params.searchParams]);

  const originData = useMemo(() => {
    if (!params.originData) return undefined;
    try {
      return JSON.parse(params.originData) as PriceTrendOriginData;
    } catch {
      return undefined;
    }
  }, [params.originData]);

  if (!searchParams) {
    return (
      <Screen className="flex-1 bg-white">
        <RegistrationHeader title="시세검색" />
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-gray700">시세 조회 정보가 없습니다.</Text>
        </View>
      </Screen>
    );
  }

  const summaryTitle = `${searchParams.year}년 ${searchParams.manufacturerCategories?.name ?? ""} ${searchParams.model?.name ?? ""} ${searchParams.tons}톤 ${searchParams.axis?.code === "NONE" ? "" : searchParams.axis?.desc ?? ""} ${searchParams.loaded?.desc ?? ""}`;

  return (
    <Screen className="flex-1 bg-white">
      <RegistrationHeader title="시세검색" />
      <View className="flex-1">
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="mt-6 rounded-lg bg-[#F1F5FF] p-4">
            <Text className="text-[18px] font-bold leading-[24px] text-gray800">
              {summaryTitle.trim()}
            </Text>
            <Text className="mt-2 text-[14px] leading-[17px] text-gray800">
              해당 차종의 평균 직거래 시세 정보를 불러왔어요.
            </Text>
          </View>
          <CarPriceTrendInfoView searchParams={searchParams} apiType="public" />
        </ScrollView>

        <View className="border-t border-gray300 bg-white px-4 pt-3">
          <Pressable
            className="items-center rounded-lg bg-primary py-4"
            onPress={() =>
              router.push({
                pathname: "/sell-car",
                params: {
                  type: PRODUCT_TYPE_DIRECT,
                },
              })
            }
          >
            <Text className="text-[16px] font-bold text-white">내 차 판매하러가기</Text>
          </Pressable>
          <Text className="mt-2 text-center text-[13px] text-primary">
            입력한 정보로 빠르게! 차량을 판매해보세요.
          </Text>
        </View>
      </View>
    </Screen>
  );
}
