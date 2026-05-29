import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

import { getLicensePrice } from "@/src/api/license";
import { Screen } from "@/src/components/common/Screen";
import { LicenseActionCards } from "@/src/features/license/components/LicenseActionCards";
import { LicenseListCard } from "@/src/features/license/components/LicenseListCard";
import { LicenseMarketPriceCard } from "@/src/features/license/components/LicenseMarketPriceCard";
import { fetchLicenseListAll } from "@/src/features/license/fetchLicenseListAll";
import { useLicenseSearch } from "@/src/features/license/LicenseSearchContext";
import type { LicenseItem } from "@/src/features/license/types";
import { RegistrationHeader } from "@/src/features/sell-car/registration/RegistrationHeader";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";

export default function LicenseTradeScreen() {
  const { listPaddingBottom } = useScreenInsets();
  const { params, resetParams, hasFilterChanged } = useLicenseSearch();
  const [priceData, setPriceData] = useState<Awaited<
    ReturnType<typeof getLicensePrice>
  > | null>(null);
  const [items, setItems] = useState<LicenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [priceRes, listResult] = await Promise.all([
        getLicensePrice(),
        fetchLicenseListAll(params),
      ]);
      setPriceData(priceRes);
      setItems(listResult.items);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [params]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  return (
    <Screen className="flex-1 bg-white">
      <RegistrationHeader title="번호판 거래" />
      <View className="border-b border-gray300 px-4 py-3">
        <Pressable
          onPress={() => router.push("/license/search")}
          className="h-11 flex-row items-center rounded-lg border border-gray300 bg-white px-3"
        >
          <Text className="flex-1 text-[15px] text-gray600">번호판 검색</Text>
          <Ionicons name="search" size={20} color="#666" />
        </Pressable>
      </View>

      {hasFilterChanged ? (
        <View className="flex-row justify-end px-4 py-2">
          <Pressable className="flex-row items-center" onPress={resetParams}>
            <Ionicons name="refresh" size={16} color="#666" />
            <Text className="ml-1 text-[13px] text-gray800">필터해제</Text>
          </Pressable>
        </View>
      ) : null}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: listPaddingBottom }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
      >
        <View className="gap-3 p-4">
          <LicenseMarketPriceCard data={priceData} />
          <Text className="text-[12px] leading-[18px] text-gray700">
            • 이달의 번호판 시세는 차량 연식, 증톤 가능 여부에 따라 실제 거래
            가격과 차이가 있을수 있습니다.
          </Text>
        </View>

        <View className="px-4 pb-4">
          <LicenseActionCards
            onPressPurchase={() => router.push("/license/purchase/guide")}
            onPressSales={() => router.push("/license/sales/guide")}
          />
        </View>

        {loading ? (
          <ActivityIndicator className="py-10" />
        ) : items.length === 0 ? (
          <View className="items-center px-6 py-16">
            <Ionicons name="document-text-outline" size={80} color="#dcdcdc" />
            <Text className="mt-6 text-center text-[16px] text-gray700">
              판매 중인 번호판이 없습니다.{"\n"}필터를 다시 설정해주세요.
            </Text>
          </View>
        ) : (
          <View className="gap-3 px-4 pb-8">
            {items.map((item) => (
              <LicenseListCard key={item.id} item={item} onRequested={load} />
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
