import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { ONBOARDING_COMPLETED_KEY } from "@/src/features/onboarding/onboardingConstants";
import { useAuth } from "@/src/hooks/useAuth";

export default function Index() {
  const { isInitializing } = useAuth();
  const [storageReady, setStorageReady] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);

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

  useEffect(() => {
    if (!isInitializing && storageReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isInitializing, storageReady]);

  if (isInitializing || !storageReady) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FFFFFF",
        }}
      >
        <ActivityIndicator color="#2563EB" />
      </View>
    );
  }

  if (!onboardingDone) {
    return <Redirect href="/intro" />;
  }

  return <Redirect href="/(tabs)" />;
}
