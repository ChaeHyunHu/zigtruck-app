import { Image } from "expo-image";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

import { getMyLicenses } from "@/src/api/license";
import { Screen } from "@/src/components/common/Screen";
import { IMAGE_BASE_URL } from "@/src/constants/url";
import { LicenseMyListCard } from "@/src/features/license/components/LicenseMyListCard";
import type { LicenseItem } from "@/src/features/license/types";
import { RegistrationHeader } from "@/src/features/sell-car/registration/RegistrationHeader";
import { useAuth } from "@/src/hooks/useAuth";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";
import { navigateToLogin } from "@/src/lib/authNavigation";
import { pickArray } from "@/src/utils/pickArray";

const EMPTY_ICON = `${IMAGE_BASE_URL}/license_none_icon.png`;

export default function MyLicenseScreen() {
  const { listPaddingBottom } = useScreenInsets();
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<LicenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const res = await getMyLicenses();
      setItems(pickArray(res.data).map((raw) => raw as LicenseItem));
    } catch {
      // 갱신 실패 시 기존 목록을 유지 (재진입 시 빈 화면 깜빡임 방지)
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated) {
        navigateToLogin();
        return;
      }
      // 첫 로딩에만 전체 스피너 노출. 재진입 시엔 기존 목록을 유지한 채
      // 백그라운드로 갱신해 "느리다"는 체감을 줄인다.
      load();
    }, [isAuthenticated, load]),
  );

  return (
    <Screen className="flex-1 bg-white">
      <RegistrationHeader title="내 번호판 관리" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: listPaddingBottom,
          paddingHorizontal: 16,
          paddingTop: 12,
        }}
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
        {loading ? (
          <ActivityIndicator className="py-16" />
        ) : items.length === 0 ? (
          <View className="min-h-[400px] flex-1 items-center justify-center py-16">
            <Image
              source={{ uri: EMPTY_ICON }}
              style={{ width: 120, height: 120 }}
              contentFit="contain"
            />
            <Text className="mt-4 text-[16px] text-gray600">
              번호판 내역이 없습니다.
            </Text>
          </View>
        ) : (
          <View className="gap-3 pb-6">
            {items.map((item) => (
              <LicenseMyListCard
                key={item.id}
                item={item}
                onChanged={load}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
