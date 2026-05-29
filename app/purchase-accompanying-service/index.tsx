import { useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";

import { createPurchaseAccompanyingServices } from "@/src/api/AdditionalServices/createAdditionalServices";
import { AdditionalServiceApplyScreen } from "@/src/features/additional-services/components/AdditionalServiceApplyScreen";
import { PurchaseAccompanyingGuideView } from "@/src/features/additional-services/components/PurchaseAccompanyingGuideView";
import { parseVehicleParams } from "@/src/features/additional-services/parseVehicleParams";

export default function PurchaseAccompanyingServiceScreen() {
  const params = useLocalSearchParams();
  const initialVehicle = useMemo(() => parseVehicleParams(params), [params]);

  return (
    <AdditionalServiceApplyScreen
      serviceType="purchase-accompanying-service"
      title="구매 동행 서비스"
      applyLabel="서비스 신청하기"
      completedLabel="서비스 신청완료"
      guide={<PurchaseAccompanyingGuideView />}
      showVehicleSelector={true}
      vehicleLabel="구매할 차량 선택하기"
      vehicleSelectPath="/purchase-accompanying-service/select"
      initialVehicle={initialVehicle}
      submitRequest={(payload) =>
        createPurchaseAccompanyingServices({
          name: payload.name,
          phoneNumber: payload.phoneNumber,
          productId: payload.productId,
        })
      }
      successMessage="차량 구매 동행 서비스를 신청했어요."
      confirmContent={({ truckName, productId }) => ({
        title: productId ? truckName : undefined,
        body: productId
          ? "선택한 차량으로 차량 구매 동행\n서비스를 신청할까요?"
          : "구매 동행 서비스를\n신청하시겠어요?",
      })}
    />
  );
}
