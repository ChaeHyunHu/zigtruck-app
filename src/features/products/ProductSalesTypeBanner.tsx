import { Image } from "expo-image";
import React, { memo } from "react";
import { Text, View } from "react-native";

import { GradientText } from "@/src/components/common/GradientMask";
import {
  SALES_TYPE_ASSURANCE,
  SALES_TYPE_CONSIGNMENT,
  SALES_TYPE_NORMAL,
  SALES_TYPE_THIRD_PARTY_DEALER,
} from "@/src/constants/products";
import {
  ASSURANCE_GREEN,
  INSPECTION_COMPLETED_ICON_URL,
  isAssuranceMaintenanceSale,
} from "@/src/features/products/assuranceInspection";
import type { ProductDetail } from "@/src/features/products/types";
import { enumCode } from "@/src/features/products/utils";

type Props = {
  detail: ProductDetail;
};

export const ProductSalesTypeBanner = memo(function ProductSalesTypeBanner({
  detail,
}: Props) {
  const salesTypeCode = enumCode(detail.salesType);
  const isMaintenance = isAssuranceMaintenanceSale(
    detail.salesType,
    detail.status,
  );

  if (!salesTypeCode) return null;

  const content = (() => {
    switch (salesTypeCode) {
      case SALES_TYPE_NORMAL:
        return (
          <Text className="text-[14px] leading-5 text-gray800">
            개인 차주가 판매 중인{" "}
            <Text className="font-bold text-primary-10">직거래 차량</Text>
            입니다.
          </Text>
        );
      case SALES_TYPE_CONSIGNMENT:
        return (
          <View className="flex-row flex-wrap items-center">
            <Text className="text-[14px] leading-5 text-gray800">
              판매자 요청에 의해 직트럭이 위탁 판매 중인{" "}
            </Text>
            <GradientText
              style={{ fontSize: 14, lineHeight: 20, fontWeight: "700" }}
            >
              위탁판매 차량
            </GradientText>
            <Text className="text-[14px] leading-5 text-gray800">입니다.</Text>
          </View>
        );
      case SALES_TYPE_ASSURANCE:
        if (isMaintenance) {
          return (
            <Text className="text-[14px] leading-5 text-gray800">
              입고되어 점검 및 정비 진행 중인{" "}
              <Text className="font-bold" style={{ color: ASSURANCE_GREEN }}>
                직트럭 상품용 차량{" "}
              </Text>
              입니다.
            </Text>
          );
        }
        return (
          <View className="flex-row items-center gap-2">
            <Image
              source={{ uri: INSPECTION_COMPLETED_ICON_URL }}
              style={{ width: 32, height: 32 }}
              contentFit="contain"
            />
            <Text className="flex-1 text-[14px] leading-5 text-gray800">
              점검 및 수리 후 상품화가 완료된{" "}
              <Text className="font-bold" style={{ color: ASSURANCE_GREEN }}>
                직트럭 상품용 차량
              </Text>
              입니다.
            </Text>
          </View>
        );
      case SALES_TYPE_THIRD_PARTY_DEALER:
        return (
          <View className="gap-1">
            <Text className="text-[14px] leading-5 text-gray800">
              타 매매상사의 딜러가 판매 중인{" "}
              <Text className="font-bold text-gray800">타사딜러 차량</Text>
              입니다.
            </Text>
            <Text className="text-[14px] leading-5 text-gray700">
              ※ 직트럭은 등록 시스템만을 제공하며, 판매자가 직접 등록한 차량의
              모든 책임은 판매자에게 있습니다.
            </Text>
          </View>
        );
      default:
        return null;
    }
  })();

  if (!content) return null;

  return (
    <>
      <View className="mt-4 rounded-[12px] border border-gray300 bg-white px-4 py-[14px]">
        {content}
      </View>
      {isMaintenance && detail.productsSalesNotice ? (
        <View className="mt-4 rounded-[12px] border border-gray300 bg-gray100 px-4 py-[14px]">
          <Text className="text-[14px] leading-5 text-gray800">
            {detail.productsSalesNotice}
          </Text>
        </View>
      ) : null}
    </>
  );
});
