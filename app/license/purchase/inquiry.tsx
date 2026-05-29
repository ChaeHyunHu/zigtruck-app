import { router } from "expo-router";
import React from "react";
import { View } from "react-native";

import { Screen } from "@/src/components/common/Screen";
import { LicenseInquiryForm } from "@/src/features/license/components/LicenseInquiryForm";
import { RegistrationHeader } from "@/src/features/sell-car/registration/RegistrationHeader";

export default function LicensePurchaseInquiryScreen() {
  return (
    <Screen className="flex-1 bg-white">
      <RegistrationHeader title="번호판 구매 문의" />
      <View className="flex-1">
        <LicenseInquiryForm
          mode="purchase"
          onSuccess={() => router.replace("/license")}
        />
      </View>
    </Screen>
  );
}
