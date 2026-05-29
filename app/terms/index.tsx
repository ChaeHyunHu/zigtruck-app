import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

import { getTerm } from "@/src/api/public";
import { Screen } from "@/src/components/common/Screen";
import { appColors } from "@/src/constants/colors";
import type { TermItem } from "@/src/features/terms/types";
import {
  filterTermsForMemberType,
  getTermsAudienceMemberType,
  parseTermListResponse,
} from "@/src/features/terms/utils";
import { RegistrationHeader } from "@/src/features/sell-car/registration/RegistrationHeader";
import { useAuth } from "@/src/hooks/useAuth";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";

export default function TermsListScreen() {
  const { listPaddingBottom } = useScreenInsets();
  const { isAuthenticated, profile } = useAuth();
  const [terms, setTerms] = useState<TermItem[]>([]);
  const [loading, setLoading] = useState(true);

  const audienceMemberType = getTermsAudienceMemberType(
    isAuthenticated,
    profile?.memberTypeCode,
  );

  useEffect(() => {
    getTerm()
      .then((res) => {
        const list = parseTermListResponse(res);
        setTerms(filterTermsForMemberType(list, audienceMemberType));
      })
      .catch(() => setTerms([]))
      .finally(() => setLoading(false));
  }, [audienceMemberType]);

  return (
    <Screen variant="stack" className="flex-1 bg-white">
      <RegistrationHeader title="서비스 이용약관" />
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={appColors.primary} />
          <Text className="mt-3 text-[14px] text-gray600">로딩중입니다.</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4 pt-2"
          contentContainerStyle={{ paddingBottom: listPaddingBottom + 16 }}
        >
          {terms.map((item) => (
            <Pressable
              key={item.id}
              onPress={() =>
                router.push({
                  pathname: "/terms/[type]",
                  params: { type: item.termsType.code },
                })
              }
              className="mb-3 flex-row items-center rounded-xl bg-gray100 p-4"
            >
              <Ionicons
                name="document-text-outline"
                size={22}
                color={appColors.gray600}
              />
              <Text className="ml-4 flex-1 text-[16px] font-semibold text-gray700">
                {item.termsType.desc}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={appColors.gray400} />
            </Pressable>
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}
