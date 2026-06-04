import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { Pressable, ScrollView, Text } from "react-native";

import { Screen } from "@/src/components/common/Screen";
import { appColors } from "@/src/constants/colors";
import { preloadGuideImages } from "@/src/features/guide/guideImageCache";
import { RegistrationHeader } from "@/src/features/sell-car/registration/RegistrationHeader";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";

const GUIDE_MENU = [
  { title: "화물차 구매 가이드", path: "/guide/perchase" as const },
  { title: "화물차 판매 가이드", path: "/guide/sale" as const },
];

export default function VehicleCheckGuideScreen() {
  const { listPaddingBottom } = useScreenInsets();

  useEffect(() => {
    void preloadGuideImages();
  }, []);

  return (
    <Screen variant="stack" className="flex-1 bg-gray100">
      <RegistrationHeader title="차량 확인 가이드" />
      <ScrollView
        className="flex-1 px-4 pt-3"
        contentContainerStyle={{ paddingBottom: listPaddingBottom + 16 }}
      >
        {GUIDE_MENU.map((item) => (
          <Pressable
            key={item.path}
            onPress={() => router.push(item.path)}
            className="mb-3 flex-row items-center rounded-xl bg-white px-4 py-[18px]"
          >
            <Ionicons
              name="document-text-outline"
              size={24}
              color={appColors.gray600}
            />
            <Text className="ml-3.5 flex-1 text-[16px] font-semibold text-gray800">
              {item.title}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={appColors.gray400} />
          </Pressable>
        ))}
      </ScrollView>
    </Screen>
  );
}
