import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { View } from "react-native";

import { prepareHomeBannersForSplash } from "@/src/features/home/homeBannerCache";
import { ONBOARDING_COMPLETED_KEY } from "@/src/features/onboarding/onboardingConstants";
import { useAuth } from "@/src/hooks/useAuth";

export default function Index() {
  const { isInitializing } = useAuth();
  const [storageReady, setStorageReady] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);
  // 홈으로 갈 사용자는 첫 배너 이미지가 준비되면(또는 타임아웃) true.
  const [bannersReady, setBannersReady] = useState(false);

  useEffect(() => {
    if (isInitializing) return;
    let mounted = true;
    (async () => {
      try {
        const v = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
        if (mounted) {
          setOnboardingDone(v === "true");
          setStorageReady(true);
        }
      } catch {
        if (mounted) {
          setOnboardingDone(false);
          setStorageReady(true);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isInitializing]);

  // 스플래시(직트럭 로고)를 띄운 동안 첫 홈 배너 이미지를 미리 로드한다.
  // 준비되면(또는 최대 3초) 스플래시를 내리고 홈으로 들어가 → 이미지가 늦게 뜨는 현상 방지.
  useEffect(() => {
    if (isInitializing || !storageReady) return;
    if (!onboardingDone) {
      // 온보딩 화면(intro)으로 가는 경우엔 배너를 기다릴 필요 없음
      setBannersReady(true);
      return;
    }
    let mounted = true;
    void prepareHomeBannersForSplash(3000).finally(() => {
      if (mounted) setBannersReady(true);
    });
    return () => {
      mounted = false;
    };
  }, [isInitializing, storageReady, onboardingDone]);

  useEffect(() => {
    if (!isInitializing && storageReady && bannersReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isInitializing, storageReady, bannersReady]);

  useEffect(() => {
    if (isInitializing || !storageReady || !bannersReady) return;
    router.replace(onboardingDone ? "/(tabs)" : "/intro");
  }, [isInitializing, onboardingDone, storageReady, bannersReady]);

  // 네이티브 스플래시(직트럭 로고)만 보이게 — Lottie/스피너 없음
  return <View style={{ flex: 1, backgroundColor: "#FFFFFF" }} />;
}
