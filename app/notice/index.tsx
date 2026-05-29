import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";

import { getNotice } from "@/src/api/public";
import { LoginRequiredView } from "@/src/components/auth/LoginRequiredView";
import { Screen } from "@/src/components/common/Screen";
import { appColors } from "@/src/constants/colors";
import { useAuth } from "@/src/hooks/useAuth";
import { formatNoticeDate } from "@/src/features/notice/utils";
import { RegistrationHeader } from "@/src/features/sell-car/registration/RegistrationHeader";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";

type NoticeItem = {
  id: number;
  title: string;
  contents: string;
  createdDate: string;
  modifiedDate?: string;
};

export default function NoticeListScreen() {
  const { isAuthenticated, isInitializing } = useAuth();
  const { listPaddingBottom } = useScreenInsets();
  const [items, setItems] = useState<NoticeItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadPage = useCallback(async (targetPage: number, append: boolean) => {
    if (targetPage === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await getNotice(targetPage);
      const list = response.data ?? [];
      setItems((prev) => (append ? [...prev, ...list] : list));
      setHasNext(list.length >= 10);
      setPage(targetPage);
    } catch {
      if (!append) {
        setItems([]);
      }
      setHasNext(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      setLoading(false);
      return;
    }
    void loadPage(1, false);
  }, [isAuthenticated, loadPage]);

  const onEndReached = useCallback(() => {
    if (loading || loadingMore || !hasNext) return;
    void loadPage(page + 1, true);
  }, [hasNext, loadPage, loading, loadingMore, page]);

  if (isInitializing) {
    return (
      <Screen variant="stack" className="flex-1 bg-white">
        <RegistrationHeader title="공지사항" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={appColors.primary} />
        </View>
      </Screen>
    );
  }

  if (!isAuthenticated) {
    return (
      <Screen variant="stack" className="flex-1 bg-white">
        <RegistrationHeader title="공지사항" />
        <LoginRequiredView message="공지사항은 로그인 후 확인할 수 있어요." />
      </Screen>
    );
  }

  return (
    <Screen variant="stack" className="flex-1 bg-white">
      <RegistrationHeader title="공지사항" />
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={appColors.primary} />
        </View>
      ) : items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-4">
          <Ionicons name="megaphone-outline" size={80} color={appColors.gray400} />
          <Text className="mt-4 text-[18px] text-gray700">공지사항 내역이 없어요.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: listPaddingBottom + 16 }}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          renderItem={({ item, index }) => (
            <Pressable
              onPress={() => router.push(`/notice/${item.id}`)}
              className={`mx-4 flex-row items-center justify-between py-[18px] ${
                index !== 0 ? "border-t border-gray300" : ""
              }`}
            >
              <View className="mr-3 flex-1">
                <Text className="text-[16px] font-semibold leading-[19px] text-gray800">
                  {item.title}
                </Text>
                <Text className="mt-2 text-[14px] leading-[17px] text-gray600">
                  {formatNoticeDate(item.createdDate)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={appColors.gray500} />
            </Pressable>
          )}
          ListFooterComponent={
            loadingMore ? (
              <View className="py-6">
                <ActivityIndicator color={appColors.primary} />
              </View>
            ) : null
          }
        />
      )}
    </Screen>
  );
}
