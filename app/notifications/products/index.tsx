import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import {
  deleteInterestProductNotificationSettings,
  getInterestProductsNotificationSettings,
} from "@/src/api/public";
import { LoginRequiredView } from "@/src/components/auth/LoginRequiredView";
import { Screen } from "@/src/components/common/Screen";
import { BasicButton } from "@/src/components/common/BasicButton";
import { appColors } from "@/src/constants/colors";
import { InterestProductSettingCard } from "@/src/features/interest-notification-settings/InterestProductSettingCard";
import type { InterestNotificationSettingItem } from "@/src/features/interest-notification-settings/types";
import { normalizeInterestNotificationSettings } from "@/src/features/interest-notification-settings/utils";
import { RegistrationHeader } from "@/src/features/sell-car/registration/RegistrationHeader";
import { useAuth } from "@/src/hooks/useAuth";

export default function InterestNotificationProductsScreen() {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<InterestNotificationSettingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const res = await getInterestProductsNotificationSettings();
      setItems(normalizeInterestNotificationSettings(res.data));
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const addButton = (
    <Pressable
      onPress={() => router.push("/notifications/products/form")}
      hitSlop={8}
      className="h-6 w-6 items-center justify-center rounded-md border border-gray500"
    >
      <Ionicons name="add" size={18} color={appColors.gray600} />
    </Pressable>
  );

  if (!isAuthenticated) {
    return (
      <Screen variant="stack" className="flex-1 bg-white">
        <RegistrationHeader title="관심 차량 알림 설정" onBack={() => router.back()} />
        <LoginRequiredView message="로그인 후 이용할 수 있어요." />
      </Screen>
    );
  }

  return (
    <Screen variant="stack" className="flex-1 bg-gray100">
      <RegistrationHeader
        title="관심 차량 알림 설정"
        onBack={() => router.back()}
        rightElement={items.length > 0 ? addButton : undefined}
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={appColors.primary} />
        </View>
      ) : items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="mb-6 text-center text-[18px] leading-6 text-gray700">
            설정된 관심 차량이 없습니다.{"\n"}관심 차량을 설정해주세요.
          </Text>
          <View className="w-[230px]">
            <BasicButton
              name="관심 차량 등록"
              bgColor={appColors.primary}
              borderColor={appColors.primary}
              textColor={appColors.white}
              fontSize={16}
              height={48}
              borderRadius={12}
              fontWeight="600"
              onClick={() => router.push("/notifications/products/form")}
            />
          </View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}>
          {items.map((item) => (
            <InterestProductSettingCard
              key={item.id}
              item={item}
              onEdit={() =>
                router.push({
                  pathname: "/notifications/products/[id]",
                  params: { id: String(item.id) },
                })
              }
              onDelete={async () => {
                await deleteInterestProductNotificationSettings(item.id);
                Alert.alert("완료", "관심차량을 삭제했어요.");
                await load();
              }}
            />
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}
