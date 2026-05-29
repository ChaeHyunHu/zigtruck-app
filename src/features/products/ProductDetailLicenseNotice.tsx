import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

import { appColors } from "@/src/constants/colors";
import { LicensePlateBadge } from "@/src/features/products/LicensePlateBadge";
import type { ProductDetailLicense } from "@/src/features/products/types";
import { enumDesc, toText } from "@/src/features/products/utils";

type Props = {
  license: ProductDetailLicense | null | undefined;
  truckNumber?: string;
};

export function ProductDetailLicenseNotice({ license, truckNumber }: Props) {
  if (license == null) return null;

  const licenseTypeDesc = enumDesc(license.licenseType);
  const plateNumber = toText(truckNumber, "");
  const title = licenseTypeDesc
    ? `${licenseTypeDesc} 번호판 별도 판매중`
    : "번호판 별도 판매중";
  const infoText = licenseTypeDesc
    ? `판매자가 ${licenseTypeDesc} 번호판까지 함께 판매하고 있어, 번호판이 판매되지 않으면 거래 일정이 지연될 수 있습니다.`
    : "판매자가 번호판까지 함께 판매하고 있어, 번호판이 판매되지 않으면 거래 일정이 지연될 수 있습니다.";

  return (
    <View className="mt-4 rounded-[12px] border border-gray300 bg-gray200 p-4">
      <View className="flex-col items-start gap-1.5">
        {plateNumber ? <LicensePlateBadge truckNumber={plateNumber} /> : null}
        <Text className="text-[15px] font-medium text-gray900">{title}</Text>
      </View>

      <View className="my-3 h-px bg-gray300" />

      <View className="flex-row items-start">
        <Ionicons
          name="information-circle-outline"
          size={16}
          color={appColors.gray600}
          style={{ marginTop: 1 }}
        />
        <Text className="ml-1 flex-1 text-[13px] leading-[16px] text-gray600">
          {infoText}
        </Text>
      </View>
    </View>
  );
}
