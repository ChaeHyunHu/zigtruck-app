import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useCallback } from "react";
import { View } from "react-native";

import { ONBOARDING_COMPLETED_KEY } from "@/src/features/onboarding/onboardingConstants";
import { OnboardingView } from "@/src/features/onboarding/OnboardingView";

export default function IntroScreen() {
  const finishOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
    } catch {
      // 저장 실패해도 홈으로 진입 (다음 실행 시 온보딩이 다시 나올 수 있음)
    }
    router.replace("/(tabs)");
  }, []);

  return (
    <View className="flex-1 bg-white">
      <OnboardingView onComplete={finishOnboarding} />
    </View>
  );
}
