import React, { useState } from "react";
import { Text, View } from "react-native";

import { ImgIconInfoButton } from "@/src/components/common/ImgIconInfoButton";
import {
  ProductDetailServiceBottomSheet,
  type ProductDetailServiceSheetKind,
} from "@/src/features/additional-services/components/ProductDetailServiceBottomSheet";
import { formatNumberWithComma } from "@/src/features/home/utils";
import { useLoanCalculator } from "@/src/hooks/useLoanCalculator";
import { useAuth } from "@/src/hooks/useAuth";
import { promptLogin } from "@/src/lib/authNavigation";

import type { ProductDetail } from "./types";

const COIN_ICON =
  "https://zigtruck-service-public-image.s3.ap-northeast-2.amazonaws.com/coin.png";
const DOCUMENTS_ICON =
  "https://zigtruck-service-public-image.s3.ap-northeast-2.amazonaws.com/documents.png";

type ProductDetailRecommendedServicesProps = {
  detail: ProductDetail;
};

export function ProductDetailRecommendedServices({
  detail,
}: ProductDetailRecommendedServicesProps) {
  const { isAuthenticated } = useAuth();
  const { loanCalculatorState } = useLoanCalculator(detail.price ?? 0);
  const [sheetKind, setSheetKind] = useState<ProductDetailServiceSheetKind>(null);

  const openSheet = (kind: Exclude<ProductDetailServiceSheetKind, null>) => {
    if (!isAuthenticated) {
      promptLogin();
      return;
    }
    setSheetKind(kind);
  };

  return (
    <>
      <View className="border-t-8 border-gray100 py-6">
        <Text className="mb-3 px-4 text-[18px] font-semibold text-gray800">
          이런 서비스는 어떠세요?
        </Text>
        <View className="gap-3 px-4">
          <ImgIconInfoButton
            onPress={() => openSheet("capital")}
            imageUri={COIN_ICON}
            subtitle={`이 차량을 ${loanCalculatorState.loanTerm}개월 최저금리 ${loanCalculatorState.interestRate}% 적용시`}
            mainTitle={`월 납부금 ${formatNumberWithComma(loanCalculatorState.monthlyPayment)}원`}
            description="1분 안에 신청하기!"
          />
          <ImgIconInfoButton
            onPress={() => openSheet("transfer")}
            imageUri={DOCUMENTS_ICON}
            subtitle="귀찮은 서류 업무 한번에!"
            mainTitle="서류 이전 대행 서비스"
          />
        </View>
      </View>

      <ProductDetailServiceBottomSheet
        kind={sheetKind}
        onClose={() => setSheetKind(null)}
        productId={detail.id}
        truckName={detail.truckName}
        price={detail.price}
      />
    </>
  );
}
