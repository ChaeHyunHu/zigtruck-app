import React from "react";
import { Text, View } from "react-native";

import type { LicenseEnumField } from "@/src/features/license/types";
import { getLicenseStatusBadgeStyle } from "@/src/features/license/licenseStatus";

type Props = {
  status?: LicenseEnumField;
};

export function LicenseStatusBadge({ status }: Props) {
  if (!status?.desc) return null;

  const { containerClass, textClass } = getLicenseStatusBadgeStyle(status.code);

  return (
    <View className={`rounded-lg px-2.5 py-1 ${containerClass}`}>
      <Text className={`text-[13px] font-semibold ${textClass}`}>
        {status.desc}
      </Text>
    </View>
  );
}
