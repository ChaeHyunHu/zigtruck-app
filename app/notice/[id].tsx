import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

import { getNoticeDetail } from "@/src/api/public";
import { LoginRequiredView } from "@/src/components/auth/LoginRequiredView";
import { HtmlContent } from "@/src/components/common/HtmlContent";
import { Screen } from "@/src/components/common/Screen";
import { showAppAlert } from "@/src/providers/appDialog";
import { appColors } from "@/src/constants/colors";
import { formatNoticeDate } from "@/src/features/notice/utils";
import { RegistrationHeader } from "@/src/features/sell-car/registration/RegistrationHeader";
import { useAuth } from "@/src/hooks/useAuth";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";

type NoticeDetail = {
  id: number;
  title: string;
  contents: string;
  createdDate: string;
};

export default function NoticeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isAuthenticated, isInitializing } = useAuth();
  const { listPaddingBottom } = useScreenInsets();
  const [data, setData] = useState<NoticeDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !isAuthenticated) return;
    setLoading(true);
    getNoticeDetail(id)
      .then((res) => setData(res as NoticeDetail))
      .catch(() => {
        showAppAlert({ title: "오류", message: "공지사항을 불러오지 못했습니다.", onConfirm: () => router.back() });
      })
      .finally(() => setLoading(false));
  }, [id, isAuthenticated]);

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
      ) : (
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: listPaddingBottom + 24 }}
        >
          <View className="border-b border-gray300 py-6">
            <Text className="text-[20px] font-semibold leading-[24px] text-gray900">
              {data?.title}
            </Text>
            <Text className="mt-4 text-[14px] leading-[17px] text-gray600">
              {formatNoticeDate(data?.createdDate)}
            </Text>
          </View>
          <View className="py-6">
            <HtmlContent html={data?.contents} />
          </View>
        </ScrollView>
      )}
    </Screen>
  );
}
