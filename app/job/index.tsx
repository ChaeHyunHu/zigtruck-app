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

import { Screen } from "@/src/components/common/Screen";
import { JobListCard } from "@/src/features/job/components/JobListCard";
import { fetchJobListAll } from "@/src/features/job/fetchJobList";
import { useJobSearch } from "@/src/features/job/JobSearchContext";
import type { Job } from "@/src/features/job/types";
import { RegistrationHeader } from "@/src/features/sell-car/registration/RegistrationHeader";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";

export default function JobListScreen() {
  const { listPaddingBottom } = useScreenInsets();
  const { params, resetParams, hasFilterChanged } = useJobSearch();
  const [items, setItems] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const list = await fetchJobListAll(params);
      setItems(list);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [params]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  const emptyMessage = hasFilterChanged
    ? "모집 중인 일자리가 없습니다.\n필터를 다시 설정해주세요."
    : "모집 중인 일자리가 없습니다.";

  return (
    <Screen className="flex-1 bg-white">
      <RegistrationHeader title="일자리 구하기" />
      <View className="border-b border-gray300 px-4 py-3">
        <Pressable
          onPress={() => router.push("/job/search")}
          className="h-11 flex-row items-center rounded-lg border border-gray300 bg-white px-3"
        >
          <Text className="flex-1 text-[15px] text-gray600">일자리 검색</Text>
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

      {loading ? (
        <ActivityIndicator className="mt-16" />
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: listPaddingBottom,
            flexGrow: items.length === 0 ? 1 : undefined,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                void load();
              }}
            />
          }
        >
          {items.length === 0 ? (
            <View className="flex-1 items-center justify-center py-16">
              <Ionicons name="briefcase-outline" size={80} color="#D1D5DB" />
              <Text className="mt-6 text-center text-[16px] leading-6 text-gray700">
                {emptyMessage}
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {items.map((item) => (
                <JobListCard
                  key={item.id}
                  item={item}
                  onPress={() =>
                    router.push({
                      pathname: "/job/[id]",
                      params: {
                        id: String(item.id),
                        data: JSON.stringify(item),
                      },
                    })
                  }
                />
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </Screen>
  );
}
