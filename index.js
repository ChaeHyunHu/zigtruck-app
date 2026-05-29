import { Platform } from "react-native";

if (Platform.OS !== "web") {
  try {
    const {
      getMessaging,
      setBackgroundMessageHandler,
    } = require("@react-native-firebase/messaging");

    setBackgroundMessageHandler(getMessaging(), async () => {
      // notification payload 는 OS 가 표시
    });
  } catch {
    // Expo Go 등 네이티브 FCM 미포함 환경
  }
}

import "expo-router/entry";
