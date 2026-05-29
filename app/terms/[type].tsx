import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";

import { getTerm } from "@/src/api/public";
import { HtmlContent } from "@/src/components/common/HtmlContent";
import { Screen } from "@/src/components/common/Screen";
import { appColors } from "@/src/constants/colors";
import { TERM_TYPE_TITLES } from "@/src/features/terms/types";
import {
  filterTermsForMemberType,
  getTermsAudienceMemberType,
  parseTermListResponse,
} from "@/src/features/terms/utils";
import { RegistrationHeader } from "@/src/features/sell-car/registration/RegistrationHeader";
import { useAuth } from "@/src/hooks/useAuth";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";

export default function TermsDetailScreen() {
  const { type, audience } = useLocalSearchParams<{ type: string; audience?: string }>();
  const { listPaddingBottom } = useScreenInsets();
  const { isAuthenticated, profile } = useAuth();
  const [contents, setContents] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const audienceMemberType =
    audience === 'DEALER' || audience === 'NORMAL'
      ? audience
      : getTermsAudienceMemberType(isAuthenticated, profile?.memberTypeCode);

  const title = useMemo(
    () => (type ? TERM_TYPE_TITLES[type] ?? "약관" : "약관"),
    [type],
  );

  useEffect(() => {
    if (!type || !(type in TERM_TYPE_TITLES)) {
      Alert.alert("오류", "약관을 찾을 수 없습니다.", [
        { text: "확인", onPress: () => router.back() },
      ]);
      return;
    }

    setLoading(true);
    getTerm()
      .then((res) => {
        const list = filterTermsForMemberType(
          parseTermListResponse(res),
          audienceMemberType,
        );
        const matched = list.find((item) => item.termsType.code === type);
        setContents(matched?.contents ?? null);
      })
      .catch(() => {
        setContents(null);
        Alert.alert("오류", "약관을 불러오지 못했습니다.");
      })
      .finally(() => setLoading(false));
  }, [type, audienceMemberType]);

  return (
    <Screen variant="stack" className="flex-1 bg-white">
      <RegistrationHeader title={title} />
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={appColors.primary} />
          <Text className="mt-3 text-[14px] text-gray600">로딩중입니다.</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4 pt-2"
          contentContainerStyle={{ paddingBottom: listPaddingBottom + 24 }}
        >
          <HtmlContent html={contents} />
        </ScrollView>
      )}
    </Screen>
  );
}
