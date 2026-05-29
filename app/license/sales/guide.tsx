import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";

import { getLicenseSalesGuide, type LicenseGuideFaq } from "@/src/api/license";
import { Screen } from "@/src/components/common/Screen";
import { LicenseGuidePanel } from "@/src/features/license/components/LicenseGuideContent";
import { getLicenseTheme } from "@/src/features/license/licenseTheme";
import { DualFooterButtons } from "@/src/features/sell-car/registration/DualFooterButtons";
import { RegistrationHeader } from "@/src/features/sell-car/registration/RegistrationHeader";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";

export default function LicenseSalesGuideScreen() {
  const salesTheme = getLicenseTheme("sales");
  const { listPaddingBottom } = useScreenInsets();
  const [faqs, setFaqs] = useState<LicenseGuideFaq[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLicenseSalesGuide()
      .then((data) => setFaqs(data.guideList ?? []))
      .catch(() => setFaqs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Screen className="flex-1 bg-white">
      <RegistrationHeader title="번호판 판매 가이드" />
      {loading ? (
        <ActivityIndicator className="mt-10" />
      ) : (
        <ScrollView
          className="flex-1 px-4 pt-3"
          contentContainerStyle={{ paddingBottom: listPaddingBottom + 72 }}
        >
          <LicenseGuidePanel variant="sales" faqs={faqs} />
        </ScrollView>
      )}
      <View className="absolute bottom-0 left-0 right-0">
        <DualFooterButtons
          onPressLeft={() => router.back()}
          onPressRight={() => router.push("/license/sales/inquiry")}
          rightLabel="판매 문의하기"
          rightButtonColor={salesTheme.accent}
        />
      </View>
    </Screen>
  );
}
